// eslint-disable-next-line header/header
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

    abstract isTriggered(): boolean;
}
