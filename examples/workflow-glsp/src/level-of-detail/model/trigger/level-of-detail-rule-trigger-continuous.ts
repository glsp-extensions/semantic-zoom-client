// eslint-disable-next-line header/header
import { LevelOfDetailRuleTrigger } from '../level-of-detail-rule-trigger';
import { injectable } from 'inversify';

@injectable()
export class LevelOfDetailRuleTriggerContinuous extends LevelOfDetailRuleTrigger {
    private triggerFrom: number;
    private triggerTo: number;

    init(element: LevelOfDetailRuleTriggerContinuous): void {
        super.init(element);
        this.triggerFrom = element.triggerFrom;
        this.triggerTo = element.triggerTo;
    }

    isTriggered(continuousLevel?: number): boolean {
        return (continuousLevel ?? this.levelOfDetail.getContinuousLevelOfDetail()) >= this.triggerFrom
            && (continuousLevel ?? this.levelOfDetail.getContinuousLevelOfDetail()) < this.triggerTo;
    }
}
