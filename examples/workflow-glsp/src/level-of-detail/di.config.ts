// eslint-disable-next-line header/header
import { ContainerModule, interfaces } from 'inversify';

import { WORKFLOW_TYPES } from '../workflow-types';
import { LevelOfDetailRenderer } from './level-of-detail-renderer';
import { ZoomListener } from './zoom-listener';
import { TYPES } from 'sprotty/lib';
import { LevelOfDetail } from './level-of-detail';
import { LevelOfDetailRule } from './model/level-of-detail-rule';
import { LevelOfDetailRuleInterface } from './model/level-of-detail-rule.interface';
import { LevelOfDetailRuleTrigger } from './model/level-of-detail-rule-trigger';
import { LevelOfDetailRuleTriggerInterface } from './model/level-of-detail-rule-trigger.interface';
import {configureActionHandler, GLSPActionDispatcher} from "@eclipse-glsp/client";
import {SetDiscreteLevelOfDetailAction} from "./actions/set-discrete-level-of-detail-action";
import {SetDiscreteLevelOfDetailActionHandler} from "./actions/set-discrete-level-of-detail-action-handler";
import {SetLevelOfDetailRulesActionHandler} from "./actions/set-level-of-detail-rules-action-handler";
import {SetLevelOfDetailRulesAction} from "./actions/set-level-of-detail-rules-action";

import {IViewArgs, RenderingTargetKind, ViewRegistry} from "sprotty/lib/base/views/view";
import {IVNodePostprocessor} from "sprotty/lib/base/views/vnode-postprocessor";
import {LevelOfDetailModelRenderer} from "./level-of-detail-model-renderer";
import {CommandStackOptions} from "sprotty/src/base/commands/command-stack-options";

export const levelOfDetailModule = new ContainerModule((bind, _unbind, isBound) => {
    bind(ZoomListener).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.ZoomMouseListener).toService(ZoomListener);
    bind(TYPES.MouseListener).toService(ZoomListener);

    bind(LevelOfDetailRenderer).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.LevelOfDetailRenderer).toService(LevelOfDetailRenderer);

    bind(LevelOfDetail).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.LevelOfDetail).toService(LevelOfDetail);

    bind(SetDiscreteLevelOfDetailActionHandler).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.SetDiscreteLevelOfDetailActionHandler).toService(SetDiscreteLevelOfDetailActionHandler);

    bind(SetLevelOfDetailRulesActionHandler).toSelf().inSingletonScope();
    bind(WORKFLOW_TYPES.SetLevelOfDetailRuleActionHandler).toService(SetLevelOfDetailRulesActionHandler);

    // rebind ModelRendererFactory to create custom LevelOfDetailModelRenderer to inject lod handle function before each render
    _unbind(TYPES.ModelRendererFactory);
    bind(TYPES.ModelRendererFactory).toFactory<LevelOfDetailModelRenderer>((ctx) =>
        (targetKind: RenderingTargetKind, processors: IVNodePostprocessor[], args: IViewArgs = {}) => {
            const viewRegistry = ctx.container.get<ViewRegistry>(TYPES.ViewRegistry);
            const levelOfDetailRenderer = ctx.container.get<LevelOfDetailRenderer>(WORKFLOW_TYPES.LevelOfDetailRenderer);
            const levelOfDetail = ctx.container.get<LevelOfDetail>(WORKFLOW_TYPES.LevelOfDetail);
            const actionDispatcher = ctx.container.get<GLSPActionDispatcher>(TYPES.IActionDispatcher);
            return new LevelOfDetailModelRenderer(viewRegistry, targetKind, processors, args, levelOfDetailRenderer, levelOfDetail, actionDispatcher);
        });

    // rebind default CommandStackOptions to overwrite animation duration
    _unbind(TYPES.CommandStackOptions);
    bind<CommandStackOptions>(TYPES.CommandStackOptions).toConstantValue({
        defaultDuration: 75,
        undoHistoryLimit: 50
    });

    configureActionHandler({ bind, isBound }, SetDiscreteLevelOfDetailAction.KIND, SetDiscreteLevelOfDetailActionHandler)
    configureActionHandler({ bind, isBound }, SetLevelOfDetailRulesAction.KIND, SetLevelOfDetailRulesActionHandler)

    bind<interfaces.Factory<LevelOfDetailRule>>(WORKFLOW_TYPES.LevelOfDetailRuleFactory).toFactory<LevelOfDetailRule>((ctx: interfaces.Context) =>
        (element: LevelOfDetailRuleInterface) => {
            const factory: (rule: LevelOfDetailRuleInterface) => LevelOfDetailRule
                = ctx.container.get(`LevelOfDetailRuleFactory<${element.type}>`);

            return factory(element);
        });

    bind<interfaces.Factory<LevelOfDetailRuleTrigger>>(WORKFLOW_TYPES.LevelOfDetailRuleTriggerFactory).toFactory<LevelOfDetailRuleTrigger>((ctx: interfaces.Context) =>
        (element: LevelOfDetailRuleTriggerInterface) => {
            const factory: (trigger: LevelOfDetailRuleTriggerInterface) => LevelOfDetailRuleTrigger
                = ctx.container.get(`LevelOfDetailRuleTriggerFactory<${element.type}>`);

            return factory(element);
        });

    // rebind(TYPES.IAnchorComputer).to(RectangleAnchor);
});

