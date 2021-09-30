// eslint-disable-next-line header/header
import { LevelOfDetailRule } from '../level-of-detail-rule';
import { VNode } from 'snabbdom';
import { injectable } from 'inversify';
import { SShapeElement } from 'sprotty';

@injectable()
export class LayoutRule extends LevelOfDetailRule {

    layoutOptions: Record<string, any>;

    init(element: LayoutRule): void {
        super.init(element);
        this.layoutOptions = element.layoutOptions;
    }

    handle(node: VNode | undefined, element: SShapeElement): VNode | undefined {

        element.layoutOptions = {
            ...element.layoutOptions,
            ...this.layoutOptions
        };

        return node;
    }
}
