import { app, BrowserWindow, shell, Menu, dialog, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import { NudgeMeWindow } from './views/nudgeme-window';
import { NudgeMeNotification } from './views/nudgeme-notification';
import { ViewManager } from './service/view-manager-service';
import { TrayManager } from './service/tray-manager';
import { ReminderPollingService } from './service/reminder-polling';

app.whenReady().then(() => {
    const viewManager = ViewManager.getInstance();
    viewManager.register('window', new NudgeMeWindow());
    viewManager.register('notification', new NudgeMeNotification());

    TrayManager.initTray();
    Menu.setApplicationMenu(null);
    setupAutoUpdater();

    // Start polling for reminders every 1 minute
    const pollingService = ReminderPollingService.getInstance();
    pollingService.start();

    // Listen for close window events from Angular
    // ipcMain.on('close-window', () => {
    //     nudgeMeWindow.hide();
    // });

    ipcMain.on('closeWindow', () => {
        console.log('Received closeWindow event from renderer');
        ViewManager.getInstance().hideAll();
    });

    ipcMain.on('closeNotification', () => {
        console.log('Received closeNotification event from renderer');
        const notification = ViewManager.getInstance().get('notification');
        if (notification) {
            notification.hide();
        }
    });

    app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath,
        args: []
    });
}).catch(err => {
    console.error('Failed to initialise app', err);
});

function setupAutoUpdater() {
    // Check for updates on startup
    autoUpdater.checkForUpdatesAndNotify();

    // Check for updates every hour
    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 60 * 60 * 1000);

    autoUpdater.on('update-available', () => {
        console.log('Update available');
    });

    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Ready',
            message: 'A new version has been downloaded. Restart the application to apply the update.',
            buttons: ['Restart', 'Later']
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('Auto-updater error:', err);
    });
}


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
    }
});

// Open external links in default browser
app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
});
