// eslint-disable-next-line header/header
import {LevelOfDetailRule} from '../level-of-detail-rule';
import {VNode} from 'snabbdom/vnode';
import {injectable} from 'inversify';
import {SShapeElement} from 'sprotty';

@injectable()
export class VisibilityRule extends LevelOfDetailRule {

    setVisibility: boolean;

    init(element: VisibilityRule): void {
        super.init(element);
        this.setVisibility = element.setVisibility;
    }

    handle(node: VNode | undefined, element: SShapeElement): VNode | undefined {
        // console.log('handle visibility rule triggered: ' + this.trigger.isTriggered());

        if(!node || this.setVisibility) {
            return node;
        }

        node.data = node.data ? node.data : { class: {} };
        node.data.class = { ...node.data.class, hidden: true };

        return node;
    }
}
