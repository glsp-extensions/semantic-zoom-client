// eslint-disable-next-line header/header
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
    trigger: LevelOfDetailRuleTrigger;
    type: string;
    protected lastTriggerState = false;
    protected isNewlyTriggered = false;
    protected levelOfDetail: LevelOfDetail;

    @inject(WORKFLOW_TYPES.LevelOfDetailRuleTriggerFactory)
    protected triggerFactory: (element: LevelOfDetailRuleTriggerInterface) => LevelOfDetailRuleTrigger;

    init(element: LevelOfDetailRuleInterface): void {
        this.type = element.type;
        this.trigger = this.triggerFactory(element.trigger);

        // call isTriggered() once to set lastTriggeredState to the correct value
        // this prevents the renderer from causing a rerender immediately after first initialization
        this.isTriggered();
    }

    abstract handle(node: VNode | undefined, element: SShapeElement): VNode | undefined;

    getIsNewlyTriggered(): boolean {
        return this.lastTriggerState !== this.isTriggered();
    }

    isTriggered(): boolean {
        this.lastTriggerState = this.trigger.isTriggered();
        return this.lastTriggerState;
    }
}
