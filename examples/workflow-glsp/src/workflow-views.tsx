/********************************************************************************
 * Copyright (c) 2019-2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import {
    angleOfPoint,
    IView,
    Point,
    PolylineEdgeViewWithGapsOnIntersections,
    RenderingContext,
    SEdge,
    toDegrees,
    SGraphView,
    SGraph,
    GLSPActionDispatcher,
    RequestModelAction
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { svg, TYPES } from 'sprotty';

import { LevelOfDetailRenderer } from './level-of-detail/level-of-detail-renderer';
import { Icon } from './model';
import { WORKFLOW_TYPES } from './workflow-types';

import { LevelOfDetail } from './level-of-detail/level-of-detail';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class WorkflowEdgeView extends PolylineEdgeViewWithGapsOnIntersections {
    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const additionals = super.renderAdditionals(edge, segments, context);
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        const arrow = (
            <path
                class-sprotty-edge={true}
                class-arrow={true}
                d='M 1.5,0 L 10,-4 L 10,4 Z'
                transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${
                    p2.y
                })`}
            />
        );
        additionals.push(arrow);
        return additionals;
    }
}

@injectable()
export class SvgRootView<IRenderingArgs> extends SGraphView<IRenderingArgs> {
    @inject(WORKFLOW_TYPES.LevelOfDetailRenderer)
    protected levelOfDetailRenderer: LevelOfDetailRenderer;

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    protected levelOfDetail: LevelOfDetail;

    @inject(TYPES.IActionDispatcher)
    protected actionDispatcher: GLSPActionDispatcher;

    render(model: Readonly<SGraph>, context: RenderingContext, args?: IRenderingArgs): VNode {
        // stop the rendering process when an element's level of detail changes
        // call rerender only once, even when multiple elements have to be adjusted
        // TODO: move this to the correct location
        // TODO: add logic determine whether a RequestModelAction is required depending on needsClientLayout/needsServerLayout
        const needsRerender = this.levelOfDetailRenderer.needsRerender(model.children);
        if(needsRerender.client || needsRerender.server) {
            this.actionDispatcher.dispatch(new RequestModelAction({
                levelOfDetail: this.levelOfDetail.getContinuousLevelOfDetail()
            }));

            // return super.render(model, context, args);
            return <svg class-sprotty-graph={true}></svg>;
        } else {
            return super.render(model, context, args);
        }
    }
}
@injectable()
export class IconView implements IView {
    render(element: Icon, context: RenderingContext): VNode {
        const radius = this.getRadius();
        return (
            <g>
                <circle class-sprotty-icon={true} r={radius} cx={radius} cy={radius}></circle>
                {context.renderChildren(element)}
            </g>
        );
    }

    getRadius(): number {
        return 16;
    }
}
