// eslint-disable-next-line header/header
import {LevelOfDetailRule} from '../level-of-detail-rule';
import {VNode} from 'snabbdom/vnode';
import {injectable} from 'inversify';

@injectable()
export class CssClassRule extends LevelOfDetailRule {

    classes: Record<string, any>;

    init(element: CssClassRule): void {
        super.init(element);
        this.classes = element.classes;
    }

    handle(node: VNode | undefined): VNode | undefined {

        if(!node) {
            return node;
        }

        node.data = node.data ? node.data : { class: {} };
        node.data.class = {
            ...node.data.class,
            ...this.classes.reduce((acc: Record<string, boolean>, curr: string) => {
                acc[curr] = true;
                return acc;
            }, {})
        };

        return node;
    }
}
