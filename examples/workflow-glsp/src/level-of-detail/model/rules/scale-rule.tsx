// eslint-disable-next-line header/header
import {LevelOfDetailRule} from '../level-of-detail-rule';
import {VNode} from 'snabbdom/vnode';
import {WORKFLOW_TYPES} from '../../../workflow-types';
import {LevelOfDetail} from '../../level-of-detail';
import {inject, injectable} from 'inversify';
import {SShapeElement} from "sprotty";


@injectable()
export class ScaleRule extends LevelOfDetailRule {
    static readonly C_LEVEL_STRING = '$clevel';

    protected scale = 1.0;
    protected multiplyWithCLevel = false;
    protected sumWithCLevel = false;
    protected prevContinuousLevelOfDetail = -1;
    protected referencesCLevel = false;

    @inject(WORKFLOW_TYPES.LevelOfDetail)
    levelOfDetail: LevelOfDetail;

    init(element: ScaleRule): void {
        super.init(element);
        this.scale = element.scale;
        this.multiplyWithCLevel = element.multiplyWithCLevel;
        this.sumWithCLevel = element.sumWithCLevel;

        this.prevContinuousLevelOfDetail = this.levelOfDetail.getContinuousLevelOfDetail();
    }

    handle(node: VNode | undefined, element: SShapeElement): VNode | undefined {

        if(!node || !node.children || node.children.length < 1) {
            return node;
        }


        let scale = this.scale;
        if(this.multiplyWithCLevel) {
            scale = scale * this.levelOfDetail.getContinuousLevelOfDetail();
        }
        if(this.sumWithCLevel) {
            scale = scale + this.levelOfDetail.getContinuousLevelOfDetail();
        }


        if(typeof node.children[0] === "string") {
            return node
        }
        let scaleNode: VNode = node.children[0];

        scaleNode.data = scaleNode.data ? scaleNode.data : { attrs: {} };

        // scale from center point
        scaleNode.data.attrs = {
            ...scaleNode.data.attrs,
            transform: `scale(${scale}) translate(${-element.size.width/2},${-element.size.height/2})`
        };

        /* creating a new g element and adding changing children did not work
        let gNode = h("g", node.children[0].children)
        gNode.data = { "attrs": { transform: `scale(${scale})`}};
        node.children = [gNode]
        */

        return node;
    }

    getIsNewlyTriggered(): boolean {
        // also trigger when zoom level has been changed an the continuous level is referenced
        return super.getIsNewlyTriggered() || (this.referencesCLevel && this.isTriggered() && this.levelOfDetail.getContinuousLevelOfDetail() !== this.prevContinuousLevelOfDetail);
    }
}
