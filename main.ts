import { app, BrowserWindow, screen } from 'electron';
import { ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { Block } from './src_blockchain/block';
import { BlockChain } from './src_blockchain/blockchain';
import {P2P } from './src_blockchain/p2p';

const p2pPort: number = parseInt(process.env.P2P_PORT) || 6001;

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

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
//
///////////////////////////
function initBlockChain() {
  blockChain = new BlockChain();
  p2p = new P2P();

  blockChain.init(p2p);
  p2p.init(blockChain);

  p2p.initP2PServer(p2pPort);
}

///////////////////////////
//
///////////////////////////
function initIpcMain() {

  ipcMain.on('/blocks', function (event, args) {
    // win.webContents.send('/blocks', blockChain.getBlockchain());
    event.returnValue = blockChain.getBlockchain();
  });

  ipcMain.on('/mineBlock', function (event, args) {
    const newBlock: Block = blockChain.generateNextBlock(args);
    // win.webContents.send('/mineBlock', newBlock)
    event.returnValue = newBlock;
  });

  ipcMain.on('/peers', function (event, args) {
    const peers = p2p.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort);
    // win.webContents.send('/peers', peers);
    event.returnValue = peers;
  });

  ipcMain.on('/addPeer', function (event, args) {
    p2p.connectToPeers(args);
    // win.webContents.send('/addPeer');
    event.returnValue = true;
  })
}

initBlockChain();
initIpcMain();
