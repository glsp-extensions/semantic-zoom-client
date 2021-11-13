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
import { LevelOfDetailRule } from '../level-of-detail-rule';
import { VNode } from 'snabbdom';
import { injectable } from 'inversify';

@injectable()
export class VisibilityRule extends LevelOfDetailRule {
    setVisibility: boolean;

    init(element: VisibilityRule): void {
        super.init(element);
        this.setVisibility = element.setVisibility;
    }

    handle(node: VNode | undefined): VNode | undefined {
       // console.log('handle visibility rule triggered');

        if (!node || this.setVisibility) {
            return node;
        }

        node.data = node.data ? node.data : { class: {} };
        node.data.class = { ...node.data.class, hidden: true };

        // because of different implementations of getBBox(), it is not enough to only make the parent element invisible
        // child elements have to be made invisible as well for this to work in chrome and edge
        // otherwise, the getBounds action will deliver bounds for elements which are not there (invisible)
        if (node.children) {
            for (const child of node.children) {
                if (typeof child !== 'string') {
                    this.handle(child);
                }
            }
        }

        return node;
    }
}
