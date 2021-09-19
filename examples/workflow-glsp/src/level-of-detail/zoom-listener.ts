/* eslint-disable header/header */
import { injectable } from 'inversify';
import { Action, MouseListener, SModelElement, SModelRoot } from 'sprotty';

@injectable()
export class ZoomListener extends MouseListener {

    protected level = 1;

    wheel(target: SModelElement, event: WheelEvent): Action[] {
        const zoomLevel = this.getCurrentZoomFactor(target.root, event);
        console.log('Current zoom level: ' + zoomLevel);
        this.level = zoomLevel;
        return [];
    }

    public getZoomLevel(): number {
        return this.level;
    }

    protected getCurrentZoomFactor(root: SModelRoot & { zoom?: number }, event: WheelEvent): number {
        let zoom = 1;
        if (root.zoom) {
            zoom = root.zoom * this.getZoomFactor(event);
        }
        return zoom;
    }

    protected getZoomFactor(event: WheelEvent): number {
        if (event.deltaMode === event.DOM_DELTA_PAGE) {
            return Math.exp(-event.deltaY * 0.5);
        } else if (event.deltaMode === event.DOM_DELTA_LINE) {
            return Math.exp(-event.deltaY * 0.05);
        } else {// deltaMode === DOM_DELTA_PIXEL
            return Math.exp(-event.deltaY * 0.005);
        }
    }
}
