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
    trigger: LevelOfDetailRuleTrigger[];
    type: string;
    protected levelOfDetail: LevelOfDetail;

    @inject(WORKFLOW_TYPES.LevelOfDetailRuleTriggerFactory)
    protected triggerFactory: (element: LevelOfDetailRuleTriggerInterface) => LevelOfDetailRuleTrigger;

    init(element: LevelOfDetailRuleInterface): void {
        this.type = element.type;
        this.trigger = element.trigger.map((trigger) => this.triggerFactory(trigger));
    }

    abstract handle(node: VNode | undefined, element: SShapeElement): VNode | undefined;

    getIsNewlyTriggered(currZoomLevel: number, prevZoomLevel: number): boolean {
        return this.trigger.some(trigger => trigger.isTriggered(currZoomLevel) !== trigger.isTriggered(prevZoomLevel))
    }

    isTriggered(zoomLevel?: number): boolean {
        return this.trigger.some(trigger => trigger.isTriggered(zoomLevel))
    }
}
