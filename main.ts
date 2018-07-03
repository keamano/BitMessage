import { app, BrowserWindow, screen } from 'electron';
import { ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { Me } from './src_blockchain/me';

import { Block } from './src_blockchain/block';
import { BlockChain } from './src_blockchain/blockchain';
import { P2P } from './src_blockchain/p2p';

const p2pPort: number = parseInt(process.env.P2P_PORT) || 6001;

// Electron
let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

// Me
let me: Me;

// Block Chain
let blockChain: BlockChain;
let p2p: P2P;

///////////////////////////
//
///////////////////////////
function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

///////////////////////////
//
///////////////////////////
try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

///////////////////////////
// ユーザ読み込み
///////////////////////////
function initMe() {
  me = new Me(app.getPath('userData'));
  me.load();
}
initMe();

///////////////////////////
//
///////////////////////////
function initBlockChain() {
  blockChain = new BlockChain();
  p2p = new P2P();

  blockChain.init(p2p, function (blocks: Block[]) {
    win.webContents.send('/onBlocks', blockChain.getBlockchain());
  });

  p2p.init(blockChain, function (websockets: WebSocket[]) {
    const peers = p2p.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort);
    win.webContents.send('/onPeers', peers);
  });

  p2p.initP2PServer(p2pPort);
}
initBlockChain();

///////////////////////////
//
///////////////////////////
function initIpcMain() {

  ipcMain.on('/blocks', function (event, args) {
    // 同期
    // event.returnValue = blockChain.getBlockchain();

    // 非同期
    win.webContents.send('/onBlocks', blockChain.getBlockchain());
  });

  ipcMain.on('/mineBlock', function (event, args) {
    // 非同期
    const newBlock: Block = blockChain.generateNextBlock(args);
    // event.returnValue = newBlock;

    // 非同期
    // win.webContents.send('/mineBlock', newBlock)
  });

  ipcMain.on('/peers', function (event, args) {
    // 同期
    // const peers = p2p.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort);
    // event.returnValue = peers;

    // 非同期
    const peers = p2p.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort);
    win.webContents.send('/onPeers', peers);
  });

  ipcMain.on('/addPeer', function (event, args) {
    // 非同期
    p2p.connectToPeers(args);
    // event.returnValue = true;

    // 非同期
    // win.webContents.send('/addPeer');
  });

  // ユーザ管理

  ipcMain.on('/signUp', function (event, args) {
    me.name = args;
    me.save();
    win.webContents.send('/onMe', me.name);
  });

  ipcMain.on('/me', function (event, args) {
    win.webContents.send('/onMe', me.name);
  });
}
initIpcMain();
