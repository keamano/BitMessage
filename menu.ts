import { BrowserWindow, MenuItemConstructorOptions, WebContents } from 'electron';

export function getMenuTemplate(toggleExplorer: Function, togglePeer: Function): MenuItemConstructorOptions[] {

    const MENU_TEMPLATE: MenuItemConstructorOptions[] = [
        {
            label: 'BlockChain',
            submenu: [
                {
                    label: 'Explorer',
                    accelerator: 'CmdOrCtrl+E',
                    click: (item, focusedWindow) => {
                        toggleExplorer(focusedWindow);
                    }
                }, {
                    label: 'Peer',
                    accelerator: 'CmdOrCtrl+P',
                    click: (item, focusedWindow) => {
                        togglePeer(focusedWindow);
                    }
                }
            ]
        }, {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            // on reload, start fresh and close any old
                            // open secondary windows
                            if (focusedWindow.id === 1) {
                                BrowserWindow.getAllWindows().forEach(win => {
                                    if (win.id > 1) win.close()
                                })
                            }
                            focusedWindow.reload()
                        }
                    }
                }, {
                    label: 'Toggle Full Screen',
                    accelerator: (() => {
                        if (process.platform === 'darwin') {
                            return 'Ctrl+Command+F'
                        } else {
                            return 'F11'
                        }
                    })(),
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                        }
                    }
                }, {
                    label: 'Toggle Developer Tools',
                    accelerator: (() => {
                        if (process.platform === 'darwin') {
                            return 'Alt+Command+I'
                        } else {
                            return 'Ctrl+Shift+I'
                        }
                    })(),
                    click: (item, focusedWindow: any) => {
                        if (focusedWindow) {
                            focusedWindow = focusedWindow as WebContents;
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
