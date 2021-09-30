/********************************************************************************
 * Copyright (c) 2019-2021 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import '../css/diagram.css';
import 'balloon-css/balloon.min.css';
import 'sprotty/css/edit-label.css';

import {
    boundsModule,
    buttonModule,
    configureDefaultModelElements,
    configureModelElement,
    ConsoleLogger,
    defaultGLSPModule,
    defaultModule,
    DefaultTypes,
    DeleteElementContextMenuItemProvider,
    DiamondNodeView,
    edgeIntersectionModule,
    edgeLayoutModule,
    editLabelFeature,
    expandModule,
    exportModule,
    fadeModule,
    GLSP_TYPES,
    glspCommandPaletteModule,
    glspContextMenuModule,
    glspDecorationModule,
    glspEditLabelModule,
    GLSPGraph,
    glspHoverModule,
    glspMouseToolModule,
    glspSelectModule,
    glspServerCopyPasteModule,
    glspViewportModule,
    GridSnapper,
    labelEditUiModule,
    layoutCommandsModule,
    LogLevel,
    markerNavigatorModule,
    modelHintsModule,
    modelSourceModule,
    modelSourceWatcherModule,
    navigationModule,
    NoOverlapMovmentRestrictor,
    openModule,
    overrideViewerOptions,
    paletteModule,
    RectangularNodeView,
    RevealNamedElementActionProvider,
    routingModule,
    SCompartment,
    SEdge,
    SLabel,
    SLabelView,
    toolFeedbackModule,
    toolsModule,
    TYPES,
    validationModule,
    zorderModule
} from '@eclipse-glsp/client';
import { Container, ContainerModule } from 'inversify';

import { directTaskEditor } from './direct-task-editing/di.config';
import { levelOfDetailModule } from './level-of-detail/di.config';
import { ActivityNode, Icon, TaskNode, WeightedEdge } from './model';
import {
    IconView,
    LoDRoundedCornerNodeView,
    LoDSCompartmentView,
    STextLabelView,
    SvgRootView,
    WorkflowEdgeView
} from './workflow-views';
import { registerLevelOfDetailRule, registerLevelOfDetailRuleTrigger } from './level-of-detail/level-of-detail-renderer';
import { VisibilityRule } from './level-of-detail/model/rules/visibility-rule';
import { LevelOfDetailRuleTriggerContinuous } from './level-of-detail/model/trigger/level-of-detail-rule-trigger-continuous';
import { LevelOfDetailRuleTriggerDiscrete } from './level-of-detail/model/trigger/level-of-detail-rule-trigger-discrete';
import { CssStyleRule } from './level-of-detail/model/rules/css-style-rule';
import { configureCommand } from 'sprotty';
import { WorkflowRequestBoundsCommand } from './commands/request-bounds-command';
import { CssClassRule } from './level-of-detail/model/rules/css-class-rule';
import { ScaleRule } from './level-of-detail/model/rules/scale-rule';
import { LayoutRule } from './level-of-detail/model/rules/layout-rule';

const workflowDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    bind(GLSP_TYPES.IMovementRestrictor).to(NoOverlapMovmentRestrictor).inSingletonScope();
    bind(TYPES.ISnapper).to(GridSnapper);
    bind(TYPES.ICommandPaletteActionProvider).to(RevealNamedElementActionProvider);
    bind(TYPES.IContextMenuItemProvider).to(DeleteElementContextMenuItemProvider);
    const context = { bind, unbind, isBound, rebind };

    // configureCommand(context, RerenderModelCommand);
    configureCommand(context, WorkflowRequestBoundsCommand);

    configureDefaultModelElements(context);
    configureModelElement(context, DefaultTypes.GRAPH, GLSPGraph, SvgRootView);

    configureModelElement(context, 'task:automated', TaskNode, LoDRoundedCornerNodeView);
    configureModelElement(context, 'task:manual', TaskNode, LoDRoundedCornerNodeView);
    configureModelElement(context, 'label:heading', SLabel, STextLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'label:text', SLabel, STextLabelView);
    configureModelElement(context, 'comp:comp', SCompartment, LoDSCompartmentView);
    configureModelElement(context, 'comp:header', SCompartment, LoDSCompartmentView);
    configureModelElement(context, 'label:icon', SLabel, SLabelView);
    configureModelElement(context, DefaultTypes.EDGE, SEdge, WorkflowEdgeView);
    configureModelElement(context, 'edge:weighted', WeightedEdge, WorkflowEdgeView);
    configureModelElement(context, 'icon', Icon, IconView);
    configureModelElement(context, 'activityNode:merge', ActivityNode, DiamondNodeView);
    configureModelElement(context, 'activityNode:decision', ActivityNode, DiamondNodeView);
    configureModelElement(context, 'activityNode:fork', ActivityNode, RectangularNodeView);
    configureModelElement(context, 'activityNode:join', ActivityNode, RectangularNodeView);

    registerLevelOfDetailRule(context,'lod:rule-visibility', VisibilityRule);
    registerLevelOfDetailRule(context,'lod:rule-cssstyle', CssStyleRule);
    registerLevelOfDetailRule(context,'lod:rule-cssclass', CssClassRule);
    registerLevelOfDetailRule(context,'lod:rule-scale', ScaleRule);
    registerLevelOfDetailRule(context,'lod:rule-layout', LayoutRule);
    registerLevelOfDetailRuleTrigger(context,'lod:rule-trigger-continuous', LevelOfDetailRuleTriggerContinuous);
    registerLevelOfDetailRuleTrigger(context,'lod:rule-trigger-discrete', LevelOfDetailRuleTriggerDiscrete);
});

export default function createContainer(widgetId: string): Container {
    const container = new Container();

    container.load(defaultModule, defaultGLSPModule, glspMouseToolModule, validationModule, glspSelectModule, boundsModule, glspViewportModule, toolsModule,
        glspHoverModule, fadeModule, exportModule, expandModule, openModule, buttonModule, modelSourceModule, labelEditUiModule, glspEditLabelModule,
        workflowDiagramModule, toolFeedbackModule, modelHintsModule, glspContextMenuModule, glspServerCopyPasteModule, modelSourceWatcherModule,
        glspCommandPaletteModule, paletteModule, routingModule, glspDecorationModule, edgeLayoutModule, zorderModule, levelOfDetailModule, edgeIntersectionModule,
        layoutCommandsModule, directTaskEditor, navigationModule, markerNavigatorModule);

    overrideViewerOptions(container, {
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden'
    });

    return container;
}
