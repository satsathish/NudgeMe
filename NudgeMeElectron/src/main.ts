import { app, BrowserWindow, shell, Tray, Menu, nativeImage } from 'electron';
import * as path from 'node:path';
import { NudgeMeWindow } from './nudgeme-window';
import { NudgeMeNotification } from './nudgeme-notification';

let tray: Tray | null = null;
let nudgeMeNotification: NudgeMeNotification;
let nudgeMeWindow: NudgeMeWindow;

function setupTray() {
    if (tray) return;

    const iconPath = path.join(__dirname, 'icon.png');
    const image = nativeImage.createFromPath(iconPath);
    tray = new Tray(image.isEmpty() ? nativeImage.createEmpty() : image);
    tray.setToolTip('NudgeMe');

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Add Nudge', click: () => {
                if (nudgeMeNotification.isVisible())
                    nudgeMeWindow.show('http://localhost:4200/add-nudge');
            }
        },
        {
            label: 'View Nudge', click: () => {
                if (nudgeMeNotification.isVisible())
                    nudgeMeNotification.show('http://localhost:4200/view-nudge');
            }
        },
        {
            label: 'Quit', click: () => {
                tray?.destroy();
                app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
        if (nudgeMeWindow.isVisible())
            nudgeMeWindow.show('http://localhost:4200/view-nudge');
    });
}

app.whenReady().then(() => {
    nudgeMeWindow = new NudgeMeWindow();
    nudgeMeNotification = new NudgeMeNotification();
    Menu.setApplicationMenu(null);
    setupTray();
    app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath,
        args: []
    });
}).catch(err => {
    console.error('Failed to initialise app', err);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        if (nudgeMeWindow.isVisible())
            nudgeMeWindow.show('http://localhost:4200');
    }
});

// Open external links in default browser
app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
});
