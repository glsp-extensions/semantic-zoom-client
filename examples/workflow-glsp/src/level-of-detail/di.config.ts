// eslint-disable-next-line header/header
import {ContainerModule, interfaces} from 'inversify';

import { WORKFLOW_TYPES } from '../workflow-types';
import {LevelOfDetailRenderer} from './level-of-detail-renderer';
import { ZoomListener } from './zoom-listener';
import {TYPES} from 'sprotty/lib';
import {LevelOfDetail} from './level-of-detail';
import {RequestBoundsListener} from './request-bounds-listener';
import {LevelOfDetailRule} from './model/level-of-detail-rule';
import {LevelOfDetailRuleInterface} from './model/level-of-detail-rule.interface';
import {LevelOfDetailRuleTrigger} from './model/level-of-detail-rule-trigger';
import {LevelOfDetailRuleTriggerInterface} from './model/level-of-detail-rule-trigger.interface';

export const levelOfDetailModule = new ContainerModule((bind, _unbind, isBound) => {
    console.log('levelOfDetailModule');

    bind(ZoomListener).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.ZoomMouseListener).toService(ZoomListener);
    bind(TYPES.MouseListener).toService(ZoomListener);

    bind(LevelOfDetailRenderer).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.LevelOfDetailRenderer).toService(LevelOfDetailRenderer);

    bind(LevelOfDetail).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.LevelOfDetail).toService(LevelOfDetail);

    bind(RequestBoundsListener).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.RequestBoundsListener).toService(RequestBoundsListener);

    bind<interfaces.Factory<LevelOfDetailRule>>(WORKFLOW_TYPES.LevelOfDetailRuleFactory).toFactory<LevelOfDetailRule>((ctx: interfaces.Context) =>
        (element: LevelOfDetailRuleInterface) => {
            const factory: (element: LevelOfDetailRuleInterface) => LevelOfDetailRule
                = ctx.container.get(`LevelOfDetailRuleFactory<${element.type}>`);

            return factory(element);
        });

    bind<interfaces.Factory<LevelOfDetailRuleTrigger>>(WORKFLOW_TYPES.LevelOfDetailRuleTriggerFactory).toFactory<LevelOfDetailRuleTrigger>((ctx: interfaces.Context) =>
        (element: LevelOfDetailRuleTriggerInterface) => {
            const factory: (element: LevelOfDetailRuleTriggerInterface) => LevelOfDetailRuleTrigger
                = ctx.container.get(`LevelOfDetailRuleTriggerFactory<${element.type}>`);

            return factory(element);
        });
});
