import { app, shell, Tray, Menu, nativeImage, NativeImage } from 'electron';
import path from "path";
import { ViewManager } from './view-manager-service';
import { NudgeMeConstant } from '../models/constant';

export class TrayManager {
    static initTray() {
        // Tray initialization logic
        const tray = new Tray(this.getTrayImage());

        tray.setToolTip('NudgeMe');
        tray.setContextMenu(this.getTrayMenu(tray));

        tray.on('double-click', () => {
            const viewManger = ViewManager.getInstance();
            viewManger.show('window', `${NudgeMeConstant.ADD_NUDGE_URL}/add-nudge`);
        });
    }
    private static getTrayMenu(tray: Tray): Menu {
        const viewManger = ViewManager.getInstance();
        return Menu.buildFromTemplate([
            {
                label: 'Add Nudge', click: () => {
                    viewManger.show(NudgeMeConstant.WindowView, `${NudgeMeConstant.ADD_NUDGE_URL}/add-nudge`);
                }
            },
            {
                label: 'View Nudge', click: () => {
                    viewManger.show(NudgeMeConstant.NotificationView, `${NudgeMeConstant.ADD_NUDGE_URL}/nudge/1`);
                }
            },
            {
                label: 'View All', click: () => {
                    shell.openExternal(`${NudgeMeConstant.ADD_NUDGE_URL}/view-nudge`);
                }
            },
            {
                label: 'Quit', click: () => {
                    tray.destroy();
                    app.quit();
                }
            }]);
    }

    private static getTrayImage(): NativeImage {
        const iconPath = path.join(__dirname, '..', 'icon.png');
        console.log('Tray icon path:', iconPath);
        const image = nativeImage.createFromPath(iconPath);

        return image.isEmpty() ? nativeImage.createEmpty() : image;
    }
}