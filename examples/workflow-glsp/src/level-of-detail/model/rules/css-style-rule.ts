// eslint-disable-next-line header/header
import { LevelOfDetailRule } from '../level-of-detail-rule';
import { VNode } from 'snabbdom';
import { WORKFLOW_TYPES } from '../../../workflow-types';
import { LevelOfDetail } from '../../level-of-detail';
import { inject, injectable } from 'inversify';

@injectable()
export class CssStyleRule extends LevelOfDetailRule {
    static readonly C_LEVEL_STRING = '$clevel';

    styles: Record<string, any>;
    protected referencesCLevel = false;

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    levelOfDetail: LevelOfDetail;

    init(element: CssStyleRule): void {
        super.init(element);
        this.styles = element.styles;

        for(const style of Object.values(this.styles)) {
            if(style.toLowerCase().includes(CssStyleRule.C_LEVEL_STRING)) {
                this.referencesCLevel = true;
                break;
            }
        }
    }

    handle(node: VNode | undefined): VNode | undefined {
        // console.log('handle css style rule triggered');

        if(!node) {
            return node;
        }

        const styles = { ...this.styles };
        for(const key of Object.keys(styles)) {
            styles[key] = this.prepareValue(styles[key]);
        }

        node.data = node.data ? node.data : { style: {} };
        node.data.style = { ...node.data.style, ...styles };

        return node;
    }

    protected prepareValue(value: string): string {
        if(value.includes(CssStyleRule.C_LEVEL_STRING)) {
            if(!value.toLowerCase().startsWith('calc')) {
                value = `calc(${value})`;
            }
            value = value.replace(
                CssStyleRule.C_LEVEL_STRING,
                String(this.levelOfDetail.getContinuousLevelOfDetail())
            );
        }
        return value;
    }

    getIsNewlyTriggered(currZoomLevel: number, prevZoomLevel: number): boolean {
        // also trigger when zoom level has been changed and the continuous level is referenced
        return super.getIsNewlyTriggered(currZoomLevel, prevZoomLevel)
            || (this.referencesCLevel && this.isTriggered(currZoomLevel) && currZoomLevel !== prevZoomLevel);
    }
}
