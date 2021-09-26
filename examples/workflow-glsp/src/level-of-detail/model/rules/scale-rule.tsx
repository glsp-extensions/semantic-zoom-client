// eslint-disable-next-line header/header
import {LevelOfDetailRule} from '../level-of-detail-rule';
import {VNode} from 'snabbdom/vnode';
import {WORKFLOW_TYPES} from '../../../workflow-types';
import {LevelOfDetail} from '../../level-of-detail';
import {inject, injectable} from 'inversify';
import {SShapeElement} from 'sprotty';

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

        if(typeof node.children[0] === 'string') {
            return node;
        }

        // scaling the root element does not work because the transform property is controlled by sprotty?
        // currently the scaling is applied to the child note which is supposed to be a <g> element
        // TODO: figure out a better and more universal solution
        // const scaleNode: VNode = node;
        const scaleNode: VNode = node.children[0];

        /* creating a new g element and adding changing children did not work
         let gNode = h("g", node.children[0].children)
         gNode.data = { "attrs": { transform: `scale(${scale})`}};
         node.children = [gNode]
         */

        scaleNode.data = scaleNode.data ? scaleNode.data : { attrs: {} };

        // text notes have a different anchor point so they are treated seperately
        const textNode = this.hasNode(scaleNode, 'text');

        // scale from center point
        let scalex = 0;
        let scaley = 0;

        if (textNode) {
            scalex = (79.8 / scale) - 79.8;
            scaley = (18 / scale) - 18;
        }

        scaleNode.data.attrs = {
            ...scaleNode.data.attrs,
            transform: `scale(${scale}) translate(${scalex},${scaley})`
            // transform: `scale(${scale})`
        };

        return node;
    }

    hasNode(node: VNode | string, nodeName: string): VNode | undefined {
        if (!node || typeof node === 'string' || !node.children) {
            return undefined;
        }

        if (node.data && node.data.class && node.data.class.hidden && node.data.class.hidden === true) {
            return undefined;
        }

        for (const n of node.children) {
            if(typeof n !== 'string' && n.sel && n.sel.startsWith(nodeName)) {
                return n;
            } else {
                const n2 = this.hasNode(n, nodeName);
                if (n2) {
                    return n2;
                }
            }
        }

        return undefined;
    }

    getIsNewlyTriggered(): boolean {
        // also trigger when zoom level has been changed an the continuous level is referenced
        return super.getIsNewlyTriggered() || (this.referencesCLevel && this.isTriggered() && this.levelOfDetail.getContinuousLevelOfDetail() !== this.prevContinuousLevelOfDetail);
    }
}
