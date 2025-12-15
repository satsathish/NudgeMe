import { NudgeMeViewInterface } from "./models/nudge-view.interface";
import { NudgeMeView } from "./nudgeme-view.abstract";

export class NudgeMeWindow extends NudgeMeView implements NudgeMeViewInterface {

    constructor() {
        super("Add");
    }

    show(url: string) {
        const sizeConfig = {
            widthPercent: 0.35,
            minWidth: 400,
            maxWidth: 1200,
            heightPercent: 1
        };
        super.show(url, sizeConfig);
    }
}