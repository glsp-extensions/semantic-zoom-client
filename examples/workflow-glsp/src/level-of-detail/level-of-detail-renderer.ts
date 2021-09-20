// eslint-disable-next-line header/header
import { inject, injectable, interfaces } from 'inversify';
import { VNode } from 'snabbdom/vnode';

import { WORKFLOW_TYPES } from '../workflow-types';
import { LevelOfDetail } from './level-of-detail';
import { LevelOfDetailRule } from './model/level-of-detail-rule';
import { LevelOfDetailRuleTrigger } from './model/level-of-detail-rule-trigger';
import {LevelOfDetailRuleTriggerInterface} from './model/level-of-detail-rule-trigger.interface';
import {LevelOfDetailRuleInterface} from './model/level-of-detail-rule.interface';
import {SChildElement} from '@eclipse-glsp/client';
import {SShapeElement} from 'sprotty';

@injectable()
export class LevelOfDetailRenderer {

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    levelOfDetail: LevelOfDetail;

    @inject(WORKFLOW_TYPES.LevelOfDetailRuleFactory)
    ruleFactory: (element: LevelOfDetailRuleInterface) => LevelOfDetailRule;

    public needsRerender(elements: Readonly<SChildElement[]>): boolean {
        for(let i = 0; i < elements.length; i++) {
            const child: SChildElement & { levelOfDetailRules?: LevelOfDetailRule[]} = elements[i];
            if(child.levelOfDetailRules && child.levelOfDetailRules.length > 0) {
                this.initRules(child);
                for(const rule of child.levelOfDetailRules) {
                    if(rule.getIsNewlyTriggered()) {
                        return true;
                    }
                }
            }
            if(this.needsRerender(child.children)) {
                return true;
            }
        }
        return false;
    }

    protected initRules(element: SChildElement & { levelOfDetailRules?: LevelOfDetailRule[] }): void {
        if (!element.levelOfDetailRules || element.levelOfDetailRules.length === 0) {
            return;
        }

        for (let i = 0; i < element.levelOfDetailRules.length; i++) {
            if (typeof element.levelOfDetailRules[i].init !== 'function') {
                console.log('initializing level-of-detail rule');
                const lodRule = this.ruleFactory(element.levelOfDetailRules[i]);
                element.levelOfDetailRules[i] = lodRule;
            }
        }
    }

    public prepareNode(element: SShapeElement & { levelOfDetailRules?: LevelOfDetailRule[] }, node: VNode): VNode | undefined {
        if (!element.levelOfDetailRules || element.levelOfDetailRules.length === 0) {
            return node;
        }
        let handledNode: VNode | undefined = node;

        this.initRules(element);

        for (const rule of element.levelOfDetailRules) {
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
