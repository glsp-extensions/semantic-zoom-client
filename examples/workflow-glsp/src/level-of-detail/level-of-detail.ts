// eslint-disable-next-line header/header
import { ILogger } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { TYPES } from 'sprotty/lib';
import { ZoomListener } from './zoom-listener';
import { WORKFLOW_TYPES } from '../workflow-types';
import {DiscreteLevelOfDetail} from "./model/discrete-rules/discrete-level-of-detail";

@injectable()
export class LevelOfDetail {
    @inject(TYPES.ILogger)
    protected logger: ILogger;

    @inject(WORKFLOW_TYPES.ZoomMouseListener)
    protected zoomListener: ZoomListener;

    protected level: number;
    protected continuousLevel: number;
    protected discreteLevel: DiscreteLevelOfDetail

    protected discreteLevelsOfDetail: DiscreteLevelOfDetail[] = [];

    public getContinuousLevelOfDetail(): number {
        this.level = this.zoomListener.getZoomLevel();
        this.continuousLevel = 1/this.level;
        return this.continuousLevel;
    }

    public continuousToDiscreteLevelOfDetail(contLevel: number): DiscreteLevelOfDetail {
        for (const level of this.discreteLevelsOfDetail) {
            if(level.from === undefined && level.to === undefined) {
                return level
            }
            else if (level.from === undefined && contLevel < level.to) {
                return level
            }
            else if (level.to === undefined && contLevel >= level.from) {
                return level
            }
            else if (contLevel >= level.from && contLevel < level.to) {
                return level
            }
        }
        throw Error("No discrete level of detail found. Has the requestDiscreteModelsOfDetailAction not been called yet?")
    }

    public getDiscreteLevelOfDetail(): DiscreteLevelOfDetail {
        this.getContinuousLevelOfDetail();

        const newLevel = this.continuousToDiscreteLevelOfDetail(this.continuousLevel);

        if (this.discreteLevel !== newLevel) {
            console.log('New discrete zoom level: ' + newLevel.name);
            this.discreteLevel = newLevel;
        }

        return this.discreteLevel;
    }

    public setCurrentZoomLevel(level: number): void {
        this.level = level;
    }

    public setDiscreteLevelsOfDetail(discreteLevels: DiscreteLevelOfDetail[]) {
        this.discreteLevelsOfDetail = discreteLevels;
        this.discreteLevel = this.continuousToDiscreteLevelOfDetail(this.getContinuousLevelOfDetail())
    }
}