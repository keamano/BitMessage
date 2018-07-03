"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
function getMenuTemplate() {
    var MENU_TEMPLATE = [
        {},
        {
            label: 'BlockChain',
            submenu: [
                {
                    label: 'Explorer',
                    accelerator: 'CmdOrCtrl+E',
                    role: 'undo'
                }, {
                    label: 'Peer',
                    accelerator: 'Shift+CmdOrCtrl+P',
                    role: 'Peer'
                }
            ]
        }, {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            // on reload, start fresh and close any old
                            // open secondary windows
                            if (focusedWindow.id === 1) {
                                electron_1.BrowserWindow.getAllWindows().forEach(function (win) {
                                    if (win.id > 1)
                                        win.close();
                                });
                            }
                            focusedWindow.reload();
                        }
                    }
                }, {
                    label: 'Toggle Full Screen',
                    accelerator: (function () {
                        if (process.platform === 'darwin') {
                            return 'Ctrl+Command+F';
                        }
                        else {
                            return 'F11';
                        }
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    }
                }, {
                    label: 'Toggle Developer Tools',
                    accelerator: (function () {
                        if (process.platform === 'darwin') {
                            return 'Alt+Command+I';
                        }
                        else {
                            return 'Ctrl+Shift+I';
                        }
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow = focusedWindow;
                            focusedWindow.toggleDevTools();
                        }
                    }
                }
            ]
        }, {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                }, {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                }, {
                    type: 'separator'
                }
            ]
        }
    ];
    return MENU_TEMPLATE;
}
exports.getMenuTemplate = getMenuTemplate;
