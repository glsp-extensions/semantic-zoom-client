// eslint-disable-next-line header/header
import { LevelOfDetailRuleTrigger } from '../level-of-detail-rule-trigger';

export class LevelOfDetailRuleTriggerDiscrete extends LevelOfDetailRuleTrigger {
    triggerDiscreteLevel: number[];

    init(element: LevelOfDetailRuleTriggerDiscrete): void {
        super.init(element);
        this.triggerDiscreteLevel = element.triggerDiscreteLevel;
    }

    isTriggered(continuousLevel?: number): boolean {

        return this.triggerDiscreteLevel.includes(continuousLevel
            ? this.levelOfDetail.continuousToDiscreteLevelOfDetail(continuousLevel)
            : this.levelOfDetail.getDiscreteLevelOfDetailIndex()
        );
    }
}
