/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
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
    SLabel,
    toDegrees,
    isEdgeLayoutable,
    getSubType,
    setAttr,
    SLabelView,
    SGraphView,
    SGraph,
    GLSPActionDispatcher,
    RoundedCornerNodeView,
    CornerRadius,
    RoundedCornerWrapper,
    toClipPathId,
    RequestBoundsAction,
    SCompartment
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { VNode } from 'snabbdom';
import { svg , Hoverable, Selectable, SShapeElement, TYPES } from 'sprotty';

import { LevelOfDetailRenderer } from './level-of-detail/level-of-detail-renderer';
import { Icon } from './model';
import { WORKFLOW_TYPES } from './workflow-types';

import { RequestBoundsListener } from './level-of-detail/request-bounds-listener';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class WorkflowEdgeView extends PolylineEdgeViewWithGapsOnIntersections {
    protected renderAdditionals(edge: SEdge, segments: Point[], context: RenderingContext): VNode[] {
        const additionals = super.renderAdditionals(edge, segments, context);
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        const arrow = <path class-sprotty-edge={true} class-arrow={true} d='M 1.5,0 L 10,-4 L 10,4 Z'
            transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`} />;
        additionals.push(arrow);
        return additionals;
    }
}

@injectable()
export class LoDRoundedCornerNodeView extends RoundedCornerNodeView {
    @inject(WORKFLOW_TYPES.LevelOfDetailRenderer)
    protected levelOfDetailRenderer: LevelOfDetailRenderer;

    render(node: Readonly<SShapeElement & Hoverable & Selectable>, context: RenderingContext): VNode | undefined {
        const cornerRadius = CornerRadius.from(node);
        if (!cornerRadius) {
            return this.renderWithoutRadius(node, context);
        }

        const wrapper = new RoundedCornerWrapper(node, cornerRadius);
        const vnode = <g class-node={true}><g>
            <defs>
                <clipPath id={toClipPathId(node)}>
                    <path d={this.renderPath(wrapper, context, this.getClipPathInsets() || 0)}></path>
                </clipPath>
            </defs>
            {this.renderPathNode(wrapper, context)}
            {context.renderChildren(node)}
        </g></g>;

        return this.levelOfDetailRenderer.prepareNode(node, vnode);
    }
}

@injectable()
export class SvgRootView<IRenderingArgs> extends SGraphView<IRenderingArgs> {
    @inject(WORKFLOW_TYPES.LevelOfDetailRenderer)
    protected levelOfDetailRenderer: LevelOfDetailRenderer;

    @inject(TYPES.IActionDispatcher)
    protected actionDispatcher: GLSPActionDispatcher;

    @inject(WORKFLOW_TYPES.RequestBoundsListener)
    protected requestBoundsListener: RequestBoundsListener;

    /*
    @multiInject(TYPES.HiddenVNodePostprocessor) @optional()
    hiddenPostprocessors: IVNodePostprocessor[];

    @inject(TYPES.ModelRendererFactory)
    modelRendererFactory: ModelRendererFactory;

    protected hiddenRenderer: ModelRenderer;
     */

    render(model: Readonly<SGraph>, context: RenderingContext, args?: IRenderingArgs): VNode {
        // stop the rendering process when an element's level of detail changes
        // call rerender only once, even when multiple elements have to be adjusted
        // TODO: move this to the correct location
        if(this.levelOfDetailRenderer.needsRerender(model.children)) {
            const root = this.requestBoundsListener.currentBoundsRootSchema;

            console.log('rerender');

            // this.hiddenRenderer = this.modelRendererFactory('hidden', this.hiddenPostprocessors);
            // console.log(this.hiddenRenderer.renderElement(root));

            // TODO: the additional server round trip can probably be avoided by making a client-side rerender
            // RequestBoundsAction triggers a rerender and adjusts all elements
            if(!root.revision || root.revision === 0) {
                root.revision = 1;
            }
            this.actionDispatcher.dispatch(new RequestBoundsAction(root));

            // this.actionDispatcher.dispatch(new UpdateModelAction(root, true));
            /*
            this.actionDispatcher.dispatch(new RerenderModelAction(
                root,
                true
            ));
             */

            return <svg class-sprotty-graph={true}></svg>;
        } else {
            return super.render(model, context, args);
        }
    }
}

@injectable()
export class STextLabelView extends SLabelView {
    @inject(WORKFLOW_TYPES.LevelOfDetailRenderer)
    protected levelOfDetailRenderer: LevelOfDetailRenderer;

    render(label: Readonly<SLabel>, context: RenderingContext): VNode | undefined {
        if (!isEdgeLayoutable(label) && !this.isVisible(label, context)) {
            return undefined;
        }
        const vnode = <text class-sprotty-label={true}>{label.text}</text>;
        const subType = getSubType(label);
        if (subType) {
            setAttr(vnode, 'class', subType);
        }
        return this.levelOfDetailRenderer.prepareNode(label, vnode);
    }
}

@injectable()
export class IconView implements IView {
    @inject(WORKFLOW_TYPES.LevelOfDetailRenderer)
    protected levelOfDetailRenderer: LevelOfDetailRenderer;

    render(element: Icon, context: RenderingContext): VNode | undefined {
        const radius = this.getRadius();
        return this.levelOfDetailRenderer.prepareNode(
            element,
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

@injectable()
export class LoDSCompartmentView implements IView {
    @inject(WORKFLOW_TYPES.LevelOfDetailRenderer)
    protected levelOfDetailRenderer: LevelOfDetailRenderer;

    render(compartment: Readonly<SCompartment>, context: RenderingContext): VNode | undefined {
        const translate = `translate(${compartment.bounds.x}, ${compartment.bounds.y})`;
        const vnode = <g transform={translate} class-sprotty-comp="{true}">
            <g>
                {context.renderChildren(compartment)}
            </g>
        </g>;
        const subType = getSubType(compartment);
        if (subType) {
            setAttr(vnode, 'class', subType);
        }
        return this.levelOfDetailRenderer.prepareNode(compartment, vnode);
    }
}
