import { BrowserWindow, BrowserWindowConstructorOptions, screen } from "electron";

export interface WindowDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface WindowSizeConfig {
    widthPercent: number;  // Percentage of screen width (0-1)
    minWidth: number;
    maxWidth: number;
    heightPercent?: number; // Optional percentage of screen height
    fixedHeight?: number;   // Optional fixed height
    yOffsetPercent?: number; // Optional Y offset from top (0-1)
}

export abstract class AbstractNudgeMeView {
    private _browerWindow!: BrowserWindow;
    private _identifier: string = '';

    get identifier(): string {
        return this._identifier;
    }

    get browserWindow(): BrowserWindow {
        return this._browerWindow;
    }

    set browserWindow(value: BrowserWindow) {
        this._browerWindow = value;
    }

    constructor(identifier: string) {
        this._identifier = identifier;
    }

    show(url: string, windowDim: WindowSizeConfig): void {

        if (!this._browerWindow) {
            this.createWindowWithDimensions(windowDim, {})
        }

        this._browerWindow.loadURL(url);
        this._browerWindow.show();
    }

    hide(): void {
        this._browerWindow?.hide();
    }

    isVisible(): boolean {
        return this._browerWindow ? this._browerWindow.isVisible() : false;
    }

    /**
     * Calculate window dimensions based on screen size and configuration
     */
    protected calculateWindowDimensions(config: WindowSizeConfig): WindowDimensions {
        const display = screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = display.workAreaSize;

        // Calculate width
        const desiredWidth = Math.min(
            config.maxWidth,
            Math.max(config.minWidth, Math.round(screenWidth * config.widthPercent))
        );

        // Calculate height
        const height = config.fixedHeight
            ? config.fixedHeight
            : Math.round(screenHeight * (config.heightPercent || 1));

        // Calculate position (right-aligned)
        const x = display.workArea.x + screenWidth - desiredWidth;
        const yOffset = config.yOffsetPercent
            ? Math.round(screenHeight * config.yOffsetPercent)
            : 0;
        const y = display.workArea.y + yOffset;

        return { x, y, width: desiredWidth, height };
    }

    /**
     * Create a window with calculated dimensions
     */
    protected createWindowWithDimensions(
        config: WindowSizeConfig,
        options: BrowserWindowConstructorOptions
    ) {
        const dimensions = this.calculateWindowDimensions(config);
        this._browerWindow = new BrowserWindow({
            ...options,
            x: dimensions.x,
            y: dimensions.y,
            width: dimensions.width,
            height: dimensions.height
        });

        this._browerWindow.on('close', (e) => {
            e.preventDefault();
            this._browerWindow.hide();
        });
    }
}