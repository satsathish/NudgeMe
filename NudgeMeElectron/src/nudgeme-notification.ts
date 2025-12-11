import { BrowserWindow, screen } from "electron";
import * as path from 'node:path';

export class NudgeMeNotification {
    private mainWindow: BrowserWindow | null = null;

    constructor() {
        this.createWindow();
    }

    public show(url: string) {
        if (this.mainWindow) {
            this.mainWindow.loadURL(url);
            this.mainWindow.show();
        }
    }

    public isVisible(): boolean {
        return this.mainWindow ? this.mainWindow.isVisible() : false;
    }

    private createWindow() {
        const display = screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = display.workAreaSize;

        // Notification style: narrower, fixed max height 250, positioned 10% from top.
        const desiredWidth = Math.min(500, Math.max(300, Math.round(screenWidth * 0.25)));
        const yOffset = Math.round(screenHeight * 0.10); // 10% from top of work area
        const notifHeight = 250; // fixed max height
        const x = display.workArea.x + screenWidth - desiredWidth; // right edge
        const y = display.workArea.y + yOffset; // 10% down

        this.mainWindow = new BrowserWindow({
            x,
            y,
            width: desiredWidth,
            height: notifHeight,
            resizable: false,
            maximizable: false,
            fullscreenable: false,
            skipTaskbar: true,
            frame: false,
            alwaysOnTop: true,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        this.mainWindow.on('close', (e) => {
            if (!this.mainWindow) return;
            e.preventDefault();
            this.mainWindow.hide();
        });

        // Adjust position if display metrics change (e.g., resolution / taskbar moves)
        screen.on('display-metrics-changed', () => {
            if (!this.mainWindow) return;
            const d = screen.getPrimaryDisplay();
            const { width: sw, height: sh } = d.workAreaSize;
            const newWidth = Math.min(500, Math.max(300, Math.round(sw * 0.25)));
            const newX = d.workArea.x + sw - newWidth;
            const newY = d.workArea.y + Math.round(sh * 0.10);
            this.mainWindow.setBounds({ x: newX, y: newY, width: newWidth, height: 250 });
        });
    }
}