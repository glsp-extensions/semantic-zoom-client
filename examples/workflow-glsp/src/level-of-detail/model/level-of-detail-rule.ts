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
import { VNode } from 'snabbdom';
import { LevelOfDetailRuleInterface } from './level-of-detail-rule.interface';
import { LevelOfDetail } from '../level-of-detail';
import { LevelOfDetailRuleTrigger } from './level-of-detail-rule-trigger';
import { inject, injectable } from 'inversify';
import { WORKFLOW_TYPES } from '../../workflow-types';
import { LevelOfDetailRuleTriggerInterface } from './level-of-detail-rule-trigger.interface';
import { SShapeElement } from 'sprotty';

@injectable()
export abstract class LevelOfDetailRule implements LevelOfDetailRuleInterface {
    trigger: LevelOfDetailRuleTrigger[];
    type: string;
    isServerRule = false;
    protected levelOfDetail: LevelOfDetail;

    @inject(WORKFLOW_TYPES.LevelOfDetailRuleTriggerFactory)
    protected triggerFactory: (element: LevelOfDetailRuleTriggerInterface) => LevelOfDetailRuleTrigger;

    init(element: LevelOfDetailRuleInterface): void {
        this.type = element.type;
        this.trigger = element.trigger.map(trigger => this.triggerFactory(trigger));
        this.isServerRule = element.isServerRule ?? false;
    }

    abstract handle(node: VNode | undefined, element: SShapeElement): VNode | undefined;

    getIsNewlyTriggered(currZoomLevel: number, prevZoomLevel: number): boolean {
        return this.trigger.some(trigger => trigger.isTriggered(currZoomLevel) !== trigger.isTriggered(prevZoomLevel));
    }

    isTriggered(zoomLevel?: number): boolean {
        return this.trigger.some(trigger => trigger.isTriggered(zoomLevel));
    }
}
