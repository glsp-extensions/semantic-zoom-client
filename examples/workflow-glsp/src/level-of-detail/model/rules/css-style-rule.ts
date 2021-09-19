// eslint-disable-next-line header/header
import {LevelOfDetailRule} from '../level-of-detail-rule';
import {VNode} from 'snabbdom/vnode';
import {WORKFLOW_TYPES} from '../../../workflow-types';
import {LevelOfDetail} from '../../level-of-detail';
import {inject, injectable} from 'inversify';

@injectable()
export class CssStyleRule extends LevelOfDetailRule {
    static readonly C_LEVEL_STRING = '$clevel';

    styles: Record<string, any>;
    protected prevContinuousLevelOfDetail = -1;
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

        this.prevContinuousLevelOfDetail = this.levelOfDetail.getContinuousLevelOfDetail();
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

        this.prevContinuousLevelOfDetail = this.levelOfDetail.getContinuousLevelOfDetail();

        node.data = node.data ? node.data : { style: {} };
        node.data.style = { ...node.data.style, ...styles};

        return node;
    }

    protected prepareValue(value: string): string {
        if(value.includes(CssStyleRule.C_LEVEL_STRING)) {
            if(!value.toLowerCase().startsWith('calc')) {
                value = `calc(${value})`;
            }
            value = value.replace(
                CssStyleRule.C_LEVEL_STRING,
                String(1/this.levelOfDetail.getContinuousLevelOfDetail())
            );
        }
        return value;
    }

    getIsNewlyTriggered(): boolean {
        // also trigger when zoom level has been changed an the continuous level is referenced
        return super.getIsNewlyTriggered() || (this.referencesCLevel && this.isTriggered() && this.levelOfDetail.getContinuousLevelOfDetail() !== this.prevContinuousLevelOfDetail);
    }
}
