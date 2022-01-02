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
import { ILogger, SChildElement, SParentElement } from '@eclipse-glsp/client';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from 'sprotty/lib';
import { ZoomListener } from './zoom-listener';
import { WORKFLOW_TYPES } from '../workflow-types';
import { DiscreteLevelOfDetail } from './model/discrete-rules/discrete-level-of-detail';
import { LevelOfDetailRuleAssignment } from './model/level-of-detail-rule-assignment';
import { LevelOfDetailRule } from './model/level-of-detail-rule';
import { LevelOfDetailRuleInterface } from './model/level-of-detail-rule.interface';
import { LevelOfDetailRuleTrigger } from './model/level-of-detail-rule-trigger';
import { LevelOfDetailRuleTriggerInterface } from './model/level-of-detail-rule-trigger.interface';

@injectable()
export class LevelOfDetail {
    @inject(TYPES.ILogger)
    protected logger: ILogger;

    @inject(WORKFLOW_TYPES.ZoomMouseListener)
    protected zoomListener: ZoomListener;

    @inject(WORKFLOW_TYPES.LevelOfDetailRuleFactory)
    ruleFactory: (element: LevelOfDetailRuleInterface) => LevelOfDetailRule;

    protected level: number;
    protected continuousLevel: number;
    protected discreteLevel: DiscreteLevelOfDetail;

    protected discreteLevelsOfDetail: DiscreteLevelOfDetail[] = [];

    private ruleAssignments: { [name: string]: LevelOfDetailRuleAssignment };

    public getContinuousLevelOfDetail(): number {
        this.level = this.zoomListener.getZoomLevel();
        this.continuousLevel = 1 / this.level;
        return this.continuousLevel;
    }

    public continuousToDiscreteLevelOfDetail(contLevel: number): number {
        for (let i = 0; i < this.discreteLevelsOfDetail.length; i++) {
            const level = this.discreteLevelsOfDetail[i];
            if (level.from === undefined && level.to === undefined) {
                return i;
            } else if (level.from === undefined && contLevel < level.to) {
                return i;
            } else if (level.to === undefined && contLevel >= level.from) {
                return i;
            } else if (level.to !== undefined && level.from !== undefined && contLevel >= level.from && contLevel < level.to) {
                return i;
            }
        }
        throw Error('No discrete level of detail found. Has the requestDiscreteModelsOfDetailAction not been called yet?');
    }

    public getDiscreteLevelOfDetail(): DiscreteLevelOfDetail {
        this.getContinuousLevelOfDetail();

        const newLevel = this.discreteLevelsOfDetail[this.continuousToDiscreteLevelOfDetail(this.continuousLevel)];

        if (this.discreteLevel !== newLevel) {
            console.log('New discrete zoom level: ' + newLevel.name);
            this.discreteLevel = newLevel;
        }

        return this.discreteLevel;
    }

    public getDiscreteLevelOfDetailIndex(): number {
        const dLevel = this.getDiscreteLevelOfDetail();
        return this.discreteLevelsOfDetail.indexOf(dLevel);
    }

    public setCurrentZoomLevel(level: number): void {
        this.level = level;
    }

    public setDiscreteLevelsOfDetail(discreteLevels: DiscreteLevelOfDetail[]): void {
        this.discreteLevelsOfDetail = discreteLevels;
        this.discreteLevel = this.discreteLevelsOfDetail[this.continuousToDiscreteLevelOfDetail(this.getContinuousLevelOfDetail())];
    }

    public setRuleAssignments(value: LevelOfDetailRuleAssignment[]): void {
        value.forEach(assignment => {
            assignment.element = assignment.element.trim().replace(/( > |> | >)/g, '>');
            assignment.rules = this.initRules(assignment.rules);
        });
        this.ruleAssignments = value.reduce((obj, item) => Object.assign(obj, { [item.element]: item }), {});
    }

    protected initRules(rules: LevelOfDetailRule[]): LevelOfDetailRule[] {
        const r: LevelOfDetailRule[] = [];

        for (let i = 0; i < rules.length; i++) {
            r.push(this.ruleFactory(rules[i]));
        }

        return r;
    }

    public getRulesForElement(element: SChildElement): LevelOfDetailRule[] {
        const r: LevelOfDetailRule[] = [];
        if (!this.ruleAssignments) {
            return [];
        }
        for (const assignment of Object.values(this.ruleAssignments)) {
            if (this.isAssignedRule(assignment.element, element)) {
                r.push(...assignment.rules);
            }
        }

        return r;
    }

    private isAssignedRule(ruleSelector: string, element: SParentElement & { parent?: SParentElement }): boolean {
        if (ruleSelector.includes(',')) {
            return ruleSelector
                .split(',')
                .map(selector => selector.trim())
                .some(selector => this.isAssignedRule(selector, element));
        }
        const substringIndex = this.getNextSubstringIndex(ruleSelector);
        const nextSelector = ruleSelector.substring(substringIndex);
        const selectorSplitIndex = nextSelector.search(/>| /g);

        if (nextSelector.includes('>')) {
            if (
                !element.parent ||
                element.type !== nextSelector.substring(selectorSplitIndex + 1) ||
                element.parent.type !== nextSelector.substring(0, selectorSplitIndex)
            ) {
                return false;
            }
            if (
                substringIndex !== -1 &&
                !this.isAssignedRule(ruleSelector.substring(0, substringIndex + selectorSplitIndex), element.parent)
            ) {
                return false;
            }
        } else if (nextSelector.includes(' ')) {
            if (element.type !== nextSelector.substring(selectorSplitIndex + 1)) {
                return false;
            }
            let currentParent: (SParentElement & { parent?: SParentElement }) | undefined = element.parent;
            let parentFound = false;
            while (currentParent) {
                if (currentParent.type === nextSelector.substring(0, selectorSplitIndex)) {
                    if (
                        substringIndex === -1 ||
                        this.isAssignedRule(ruleSelector.substring(0, substringIndex + selectorSplitIndex), currentParent)
                    ) {
                        parentFound = true;
                        break;
                    }
                }
                currentParent = currentParent.parent;
            }
            if (!parentFound) {
                return false;
            }
        } else if (nextSelector !== element.type) {
            return false;
        }

        return true;
    }

    private getNextSubstringIndex(ruleSelector: string): number {
        const n = Math.max(ruleSelector.lastIndexOf('>'), ruleSelector.lastIndexOf(' '));
        if (n === -1) {
            return -1;
        }
        const sub = ruleSelector.substring(0, n).trim();
        const n2 = Math.max(sub.lastIndexOf('>'), sub.lastIndexOf(' '));
        if (n2 === -1) {
            return -1;
        }
        return n2 + 1;
    }
}

export function registerLevelOfDetailRule<T extends LevelOfDetailRule>(
    context: { bind: interfaces.Bind; isBound: interfaces.IsBound },
    type: string,
    constr: new () => T
): void {
    context.bind<T>(type).to(constr);
    context
        .bind<interfaces.Factory<T>>(`LevelOfDetailRuleFactory<${type}>`)
        .toFactory<T>((ctx: interfaces.Context) => (element: LevelOfDetailRuleInterface) => {
            const instance = ctx.container.get<T>(element.type);
            instance.init(element);
            return instance;
        });
}

export function registerLevelOfDetailRuleTrigger<T extends LevelOfDetailRuleTrigger>(
    context: { bind: interfaces.Bind; isBound: interfaces.IsBound },
    type: string,
    constr: new () => T
): void {
    context.bind<T>(type).to(constr);
    context
        .bind<interfaces.Factory<T>>(`LevelOfDetailRuleTriggerFactory<${type}>`)
        .toFactory<T>((ctx: interfaces.Context) => (element: LevelOfDetailRuleTriggerInterface) => {
            const instance = ctx.container.get<T>(element.type);
            instance.init(element);
            return instance;
        });
}
