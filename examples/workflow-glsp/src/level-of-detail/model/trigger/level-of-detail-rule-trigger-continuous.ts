// eslint-disable-next-line header/header
import { LevelOfDetailRuleTrigger } from '../level-of-detail-rule-trigger';
import { injectable } from 'inversify';

@injectable()
export class LevelOfDetailRuleTriggerContinuous extends LevelOfDetailRuleTrigger {
    triggerContinuousLevelFrom: number;
    triggerContinuousLevelTo: number;

    init(element: LevelOfDetailRuleTriggerContinuous): void {
        super.init(element);
        this.triggerContinuousLevelTo = element.triggerContinuousLevelTo;
        this.triggerContinuousLevelFrom = element.triggerContinuousLevelFrom;
    }

    isTriggered(continuousLevel?: number): boolean {
        return (continuousLevel ?? this.levelOfDetail.getContinuousLevelOfDetail()) >= this.triggerContinuousLevelFrom
            && (continuousLevel ?? this.levelOfDetail.getContinuousLevelOfDetail()) <= this.triggerContinuousLevelTo;
    }
}
