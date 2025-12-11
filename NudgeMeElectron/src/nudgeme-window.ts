import { BrowserWindow, screen } from "electron";
import * as path from 'node:path';

export class NudgeMeWindow {
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

        // Desired width: up to 40% of screen or max 1200
        const desiredWidth = Math.min(1200, Math.max(400, Math.round(screenWidth * 0.35)));
        const x = display.workArea.x + screenWidth - desiredWidth; // right edge
        const y = display.workArea.y; // top

        this.mainWindow = new BrowserWindow({
            x,
            y,
            width: desiredWidth,
            height: screenHeight,
            minWidth: 400,
            minHeight: 300,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'preload.js')
            }
        });

        // Intercept close: just hide window & keep process alive
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
            const newWidth = Math.min(1200, Math.max(400, Math.round(sw * 0.35)));
            const newX = d.workArea.x + sw - newWidth;
            const newY = d.workArea.y;
            this.mainWindow.setBounds({ x: newX, y: newY, width: newWidth, height: sh });
        });
    }
}