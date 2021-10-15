// eslint-disable-next-line header/header
import { inject, injectable } from 'inversify';
import { VNode } from 'snabbdom';

import { WORKFLOW_TYPES } from '../workflow-types';
import { LevelOfDetail } from './level-of-detail';
import { SChildElement } from '@eclipse-glsp/client';
import { SShapeElement } from 'sprotty';

@injectable()
export class LevelOfDetailRenderer {

    lastZoomLevel = 0;

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    levelOfDetail: LevelOfDetail;

    public needsRerender(elements: Readonly<SChildElement[]>): { client: boolean, server: boolean } {
        const b = this.checkForRerender(elements);
        this.lastZoomLevel = this.levelOfDetail.getContinuousLevelOfDetail();
        return b;
    }



    protected checkForRerender(elements: Readonly<SChildElement[]>, currentValues = { client: false, server: false }): { client: boolean, server: boolean } {
        if(currentValues.client && currentValues.server) {
            return currentValues;
        }

        const currentZoomLevel = this.levelOfDetail.getContinuousLevelOfDetail();

        for(let i = 0; i < elements.length; i++) {
            const rules = this.levelOfDetail.getRulesForElement(elements[i]);
            for(const rule of rules) {
                if(rule.getIsNewlyTriggered(currentZoomLevel, this.lastZoomLevel)) {
                    if(rule.isServerRule) {
                        currentValues.server = true
                    }
                    else {
                        currentValues.client = true
                    }
                }
            }
            currentValues = this.checkForRerender(elements[i].children, currentValues)
        }
        return currentValues
    }



    public prepareNode(element: SShapeElement, node: VNode): VNode | undefined {

        const rules = this.levelOfDetail.getRulesForElement(element);

        let handledNode: VNode | undefined = node;
        for (const rule of rules) {
            if (rule.isTriggered()) {
                handledNode = rule.handle(handledNode, element);
            }
        }
        return handledNode
    }
}
