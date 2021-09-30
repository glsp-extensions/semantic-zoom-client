// eslint-disable-next-line header/header
import { inject, injectable, interfaces } from 'inversify';
import { VNode } from 'snabbdom';

import { WORKFLOW_TYPES } from '../workflow-types';
import { LevelOfDetail } from './level-of-detail';
import { LevelOfDetailRule } from './model/level-of-detail-rule';
import { LevelOfDetailRuleTrigger } from './model/level-of-detail-rule-trigger';
import { LevelOfDetailRuleTriggerInterface } from './model/level-of-detail-rule-trigger.interface';
import { LevelOfDetailRuleInterface } from './model/level-of-detail-rule.interface';
import { SChildElement } from '@eclipse-glsp/client';
import { SShapeElement } from 'sprotty';

@injectable()
export class LevelOfDetailRenderer {

    lastZoomLevel = 0;

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    levelOfDetail: LevelOfDetail;

    @inject(WORKFLOW_TYPES.LevelOfDetailRuleFactory)
    ruleFactory: (element: LevelOfDetailRuleInterface) => LevelOfDetailRule;

    public needsRerender(elements: Readonly<SChildElement[]>): boolean {
        const b = this.checkForRerender(elements);
        this.lastZoomLevel = this.levelOfDetail.getContinuousLevelOfDetail();
        return b;
    }

    protected checkForRerender(elements: Readonly<SChildElement[]>): boolean {
        const currentZoomLevel = this.levelOfDetail.getContinuousLevelOfDetail();

        for(let i = 0; i < elements.length; i++) {
            const child: SChildElement & { levelOfDetailRules?: LevelOfDetailRule[]} = elements[i];
            if(child.levelOfDetailRules && child.levelOfDetailRules.length > 0) {
                const rules = this.initRules(child);
                for(const rule of rules) {
                    if(rule.getIsNewlyTriggered(currentZoomLevel, this.lastZoomLevel)) {
                        return true;
                    }
                }
            }
            if(this.checkForRerender(child.children)) {
                return true;
            }
        }
        return false;
    }

    protected initRules(element: SChildElement & { levelOfDetailRules?: LevelOfDetailRule[] }): LevelOfDetailRule[] {
        if (!element.levelOfDetailRules || element.levelOfDetailRules.length === 0) {
            return [];
        }

        const r: LevelOfDetailRule[] = [];

        for (let i = 0; i < element.levelOfDetailRules.length; i++) {
            console.log('initializing level-of-detail rule');
            r.push(this.ruleFactory(element.levelOfDetailRules[i]));
            // element.levelOfDetailRules[i] = lodRule;
        }

        return r;
    }

    public prepareNode(element: SShapeElement & { levelOfDetailRules?: LevelOfDetailRule[] }, node: VNode): VNode | undefined {
        if (!element.levelOfDetailRules || element.levelOfDetailRules.length === 0) {
            return node;
        }
        let handledNode: VNode | undefined = node;

        const rules = this.initRules(element);

        for (const rule of rules) {
            if (rule.isTriggered()) {
                handledNode = rule.handle(handledNode, element);
            }
        }

        return handledNode;
    }
}

export function registerLevelOfDetailRule<T extends LevelOfDetailRule>(
    context: { bind: interfaces.Bind; isBound: interfaces.IsBound },
    type: string,
    constr: new () => T): void {

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
    constr: new () => T): void {

    context.bind<T>(type).to(constr);
    context
        .bind<interfaces.Factory<T>>(`LevelOfDetailRuleTriggerFactory<${type}>`)
        .toFactory<T>((ctx: interfaces.Context) => (element: LevelOfDetailRuleTriggerInterface) => {
            const instance = ctx.container.get<T>(element.type);
            instance.init(element);
            return instance;
        });
}
