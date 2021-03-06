/********************************************************************************
 * Copyright (c) 2021 EclipseSource and others.
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
import { GLSPActionDispatcher, ModelRenderer, SGraph, SModelElement, SShapeElement } from '@eclipse-glsp/client';
import { VNode } from 'snabbdom';
import { LevelOfDetailRenderer } from './level-of-detail-renderer';
import { IViewArgs, RenderingTargetKind, ViewRegistry } from 'sprotty/lib/base/views/view';
import { IVNodePostprocessor } from 'sprotty/lib/base/views/vnode-postprocessor';
import { SParentElement } from 'sprotty/lib/base/model/smodel';
import { LevelOfDetail } from './level-of-detail';
import { ViewerOptions } from 'sprotty/src/base/views/viewer-options';
import { RequestModelAction } from '@eclipse-glsp/protocol';

export class LevelOfDetailModelRenderer extends ModelRenderer {
    protected levelOfDetailRenderer?: LevelOfDetailRenderer;

    protected _postprocessors: IVNodePostprocessor[];

    protected actionDispatcher: GLSPActionDispatcher;

    protected levelOfDetail?: LevelOfDetail;

    protected viewerOptions: ViewerOptions;

    constructor(
        viewRegistry: ViewRegistry,
        targetKind: RenderingTargetKind,
        postprocessors: IVNodePostprocessor[],
        args: IViewArgs,
        levelOfDetailRenderer: LevelOfDetailRenderer | undefined,
        levelOfDetail: LevelOfDetail | undefined,
        actionDispatcher: GLSPActionDispatcher,
        viewerOptions: ViewerOptions
    ) {
        super(viewRegistry, targetKind, postprocessors, args);
        this._postprocessors = postprocessors;
        this.levelOfDetailRenderer = levelOfDetailRenderer;
        this.levelOfDetail = levelOfDetail;
        this.actionDispatcher = actionDispatcher;
        this.viewerOptions = viewerOptions;
    }

    override renderChildren(element: Readonly<SParentElement>, args?: IViewArgs): VNode[] {
        const context = args
            ? new LevelOfDetailModelRenderer(
                  this.viewRegistry,
                  this.targetKind,
                  this._postprocessors,
                  { ...args, parentArgs: this.args },
                  this.levelOfDetailRenderer,
                  this.levelOfDetail,
                  this.actionDispatcher,
                  this.viewerOptions
              )
            : this;
        return element.children.map(child => context.renderElement(child)).filter(vnode => vnode !== undefined) as VNode[];
    }

    override renderElement(element: Readonly<SModelElement>): VNode | undefined {
        const view = this.viewRegistry.get(element.type);

        if (element instanceof SGraph && this.levelOfDetailRenderer && this.levelOfDetail) {
            const needsRerender = this.levelOfDetailRenderer.needsRerender(element.children);
            if (this.viewerOptions.needsClientLayout && (needsRerender.client || needsRerender.server)) {
                this.actionDispatcher.dispatch(
                    RequestModelAction.create({
                        options: {
                            levelOfDetail: this.levelOfDetail.getContinuousLevelOfDetail()
                        }
                    })
                );
            }
        }

        let vnode = view.render(element, this, { ...this.args });

        if (this.levelOfDetailRenderer && vnode !== undefined) {
            vnode = this.levelOfDetailRenderer.prepareNode(element as SShapeElement, vnode);
        }
        if (vnode) {
            return this.decorate(vnode, element);
        } else {
            return undefined;
        }
    }
}
