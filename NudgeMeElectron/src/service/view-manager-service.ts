import { NudgeMeViewInterface } from "../models/nudge-view.interface";
import { AbstractNudgeMeView } from "../views/abstract-nudgeme-view";

export class ViewManager {
    private static instance: ViewManager;
    private views: Map<string, NudgeMeViewInterface> = new Map();

    private constructor() { }

    static getInstance(): ViewManager {
        if (!ViewManager.instance) {
            ViewManager.instance = new ViewManager();
        }
        return ViewManager.instance;
    }

    register(name: string, view: NudgeMeViewInterface): void {
        this.views.set(name, view);
    }

    get(name: string): NudgeMeViewInterface | undefined {
        return this.views.get(name);
    }

    getAll(): NudgeMeViewInterface[] {
        return Array.from(this.views.values());
    }

    show(name: string, url: string): void {
        this.hideAll();
        const view = this.views.get(name);
        if (view) {
            view.show(url);
        }
    }

    hideAll(): void {
        this.views.forEach(view => view.hide());
    }

    clear(): void {
        this.views.clear();
    }
}