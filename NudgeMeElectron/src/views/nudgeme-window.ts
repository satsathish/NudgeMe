import { NudgeMeConstant } from "../models/constant";
import { NudgeMeViewInterface } from "../models/nudge-view.interface";
import { AbstractNudgeMeView } from "./abstract-nudgeme-view";

export class NudgeMeWindow extends AbstractNudgeMeView implements NudgeMeViewInterface {

    constructor() {
        super(NudgeMeConstant.WindowView);
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