// eslint-disable-next-line header/header
import { LevelOfDetailRuleTrigger } from '../level-of-detail-rule-trigger';
import {DiscreteLevelOfDetail} from "../discrete-rules/discrete-level-of-detail";

export class LevelOfDetailRuleTriggerDiscrete extends LevelOfDetailRuleTrigger {
    triggerDiscreteLevel: DiscreteLevelOfDetail[];

    init(element: LevelOfDetailRuleTriggerDiscrete): void {
        super.init(element);
        this.triggerDiscreteLevel = element.triggerDiscreteLevel;
    }

    isTriggered(continuousLevel?: number): boolean {
        return this.triggerDiscreteLevel.includes(
            continuousLevel ? this.levelOfDetail.continuousToDiscreteLevelOfDetail(continuousLevel) : this.levelOfDetail.getDiscreteLevelOfDetail());
    }
}
