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
import { LevelOfDetail } from '../level-of-detail';
import { LevelOfDetailRuleTriggerInterface } from './level-of-detail-rule-trigger.interface';
import { WORKFLOW_TYPES } from '../../workflow-types';
import { inject, injectable } from 'inversify';

@injectable()
export abstract class LevelOfDetailRuleTrigger implements LevelOfDetailRuleTriggerInterface {
    type: string;

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    levelOfDetail: LevelOfDetail;

    init(element: LevelOfDetailRuleTriggerInterface): void {
        this.type = element.type;
    }

    abstract isTriggered(continuousLevel?: number): boolean;
}
