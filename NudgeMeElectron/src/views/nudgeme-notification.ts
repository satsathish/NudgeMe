import { NudgeMeConstant } from "../models/constant";
import { NudgeMeViewInterface } from "../models/nudge-view.interface";
import { AbstractNudgeMeView } from "./abstract-nudgeme-view";

export class NudgeMeNotification extends AbstractNudgeMeView implements NudgeMeViewInterface {

    constructor() {
        super(NudgeMeConstant.NotificationView);
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