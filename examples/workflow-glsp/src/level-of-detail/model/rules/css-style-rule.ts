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
import { WORKFLOW_TYPES } from '../../../workflow-types';
import { LevelOfDetail } from '../../level-of-detail';
import { inject, injectable } from 'inversify';

@injectable()
export class CssStyleRule extends LevelOfDetailRule {
    static readonly C_LEVEL_STRING = '$clevel';

    styles: Record<string, any>;
    protected referencesCLevel = false;

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    levelOfDetail: LevelOfDetail;

    override init(element: CssStyleRule): void {
        super.init(element);
        this.styles = element.styles;

        for (const style of Object.values(this.styles)) {
            if (style.toLowerCase().includes(CssStyleRule.C_LEVEL_STRING)) {
                this.referencesCLevel = true;
                break;
            }
        }
    }

    handle(node: VNode | undefined): VNode | undefined {
        // console.log('handle css style rule triggered');

        if (!node) {
            return node;
        }

        const styles = { ...this.styles };
        for (const key of Object.keys(styles)) {
            styles[key] = this.prepareValue(styles[key]);
        }

        node.data = node.data ? node.data : { style: {} };
        node.data.style = { ...node.data.style, ...styles };

        return node;
    }

    protected prepareValue(value: string): string {
        if (value.includes(CssStyleRule.C_LEVEL_STRING)) {
            if (!value.toLowerCase().startsWith('calc')) {
                value = `calc(${value})`;
            }
            value = value.replace(CssStyleRule.C_LEVEL_STRING, String(this.levelOfDetail.getContinuousLevelOfDetail()));
        }
        return value;
    }

    override isNewlyTriggered(currZoomLevel: number, prevZoomLevel: number): boolean {
        // also trigger when zoom level has been changed and the continuous level is referenced
        return (
            super.isNewlyTriggered(currZoomLevel, prevZoomLevel) ||
            (this.referencesCLevel && this.isTriggered(currZoomLevel) && currZoomLevel !== prevZoomLevel)
        );
    }
}
