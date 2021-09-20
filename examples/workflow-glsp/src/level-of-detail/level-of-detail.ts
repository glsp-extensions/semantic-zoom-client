// eslint-disable-next-line header/header
import { ILogger } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { TYPES } from 'sprotty/lib';
import {ZoomListener} from './zoom-listener';
import {WORKFLOW_TYPES} from '../workflow-types';

@injectable()
export class LevelOfDetail {
    @inject(TYPES.ILogger)
    protected logger: ILogger;

    @inject(WORKFLOW_TYPES.ZoomMouseListener)
    protected zoomListener: ZoomListener;

    protected level: number;
    protected continuousLevel: number;
    protected discreteLevel: DiscreteLoD = DiscreteLoD.intermediate;

    public getContinuousLevelOfDetail(): number {
        this.level = this.continuousLevel = 1/this.zoomListener.getZoomLevel();
        return this.continuousLevel;
    }

    public getDiscreteLevelOfDetail(): DiscreteLoD {
        this.level = this.zoomListener.getZoomLevel();

        let newLevel;
        if (this.level < 0.8) {
            newLevel = DiscreteLoD.overview;
        } else if (this.level < 2) {
            newLevel = DiscreteLoD.intermediate;
        } else if (this.level < 4) {
            newLevel = DiscreteLoD.detail;
        } else {
            newLevel = DiscreteLoD.detail2;
        }
        if (this.discreteLevel !== newLevel) {
            console.log('New discrete zoom level: ' + DiscreteLoD[newLevel]);
            this.discreteLevel = newLevel;
        }

        return this.discreteLevel;
    }

    public setCurrentZoomLevel(level: number): void {
        this.level = level;
    }
}

export enum DiscreteLoD {
    detail2 = 0,
    detail = 1,
    intermediate = 2,
    overview = 3
}
