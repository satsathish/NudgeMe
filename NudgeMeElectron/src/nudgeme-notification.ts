import { NudgeMeViewInterface } from "./models/nudge-view.interface";
import { NudgeMeView } from "./nudgeme-view.abstract";

export class NudgeMeNotification extends NudgeMeView implements NudgeMeViewInterface {

    constructor() {
        super("notification");
    }

    public show(url: string) {
        const sizeConfig = {
            widthPercent: 0.25,
            minWidth: 300,
            maxWidth: 500,
            fixedHeight: 250,
            yOffsetPercent: 0.10
        };
        super.show(url, sizeConfig);
    }
}