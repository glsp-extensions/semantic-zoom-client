// eslint-disable-next-line header/header
import {injectable} from 'inversify';
import {IAnchorComputer} from 'sprotty/src/features/routing/anchor';
import {PolylineEdgeRouter, RECTANGULAR_ANCHOR_KIND} from '@eclipse-glsp/client';
import {SConnectableElement} from 'sprotty/src/features/routing/model';
import {Point} from 'sprotty/src/utils/geometry';
import 'reflect-metadata';

@injectable()
export class RectangleAnchor implements IAnchorComputer {

    get kind() {
        return PolylineEdgeRouter.KIND + ':' + RECTANGULAR_ANCHOR_KIND;
    }

    getAnchor(connectable: SConnectableElement, refPoint: Point, offset = 0): Point {
        const centerX = connectable.bounds.x + connectable.bounds.width/2;
        const centerY = connectable.bounds.y + connectable.bounds.height/2;

        return {
            x: centerX,
            y: centerY
        };
    }
}

