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
    RoundedCornerNodeView,
    routingModule,
    SCompartment,
    SCompartmentView,
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
    WorkflowEdgeView
} from './workflow-views';
import { VisibilityRule } from './level-of-detail/model/rules/visibility-rule';
import { LevelOfDetailRuleTriggerContinuous } from './level-of-detail/model/trigger/level-of-detail-rule-trigger-continuous';
import { LevelOfDetailRuleTriggerDiscrete } from './level-of-detail/model/trigger/level-of-detail-rule-trigger-discrete';
import { CssStyleRule } from './level-of-detail/model/rules/css-style-rule';
import { LayoutRule } from './level-of-detail/model/rules/layout-rule';
import {registerLevelOfDetailRule, registerLevelOfDetailRuleTrigger} from "./level-of-detail/level-of-detail";

const workflowDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    bind(GLSP_TYPES.IMovementRestrictor).to(NoOverlapMovmentRestrictor).inSingletonScope();
    bind(TYPES.ISnapper).to(GridSnapper);
    bind(TYPES.ICommandPaletteActionProvider).to(RevealNamedElementActionProvider);
    bind(TYPES.IContextMenuItemProvider).to(DeleteElementContextMenuItemProvider);
    const context = { bind, unbind, isBound, rebind };

    configureDefaultModelElements(context);

    configureModelElement(context, 'task:automated', TaskNode, RoundedCornerNodeView);
    configureModelElement(context, 'task:manual', TaskNode, RoundedCornerNodeView);
    configureModelElement(context, 'label:heading', SLabel, SLabelView, { enable: [editLabelFeature] });
    configureModelElement(context, 'comp:comp', SCompartment, SCompartmentView);
    configureModelElement(context, 'comp:header', SCompartment, SCompartmentView);
    configureModelElement(context, 'label:text', SLabel, SLabelView);
    configureModelElement(context, 'label:type-text', SLabel, SLabelView);
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
    registerLevelOfDetailRule(context,'lod:rule-layout', LayoutRule);
    registerLevelOfDetailRuleTrigger(context,'lod:rule-trigger-continuous', LevelOfDetailRuleTriggerContinuous);
    registerLevelOfDetailRuleTrigger(context,'lod:rule-trigger-discrete', LevelOfDetailRuleTriggerDiscrete);
});

export default function createContainer(widgetId: string): Container {
    const container = new Container();

    container.load(
        defaultModule,
        defaultGLSPModule,
        glspMouseToolModule,
        validationModule,
        glspSelectModule,
        boundsModule,
        glspViewportModule,
        toolsModule,
        glspHoverModule,
        fadeModule,
        exportModule,
        expandModule,
        openModule,
        buttonModule,
        modelSourceModule,
        labelEditUiModule,
        glspEditLabelModule,
        workflowDiagramModule,
        toolFeedbackModule,
        modelHintsModule,
        glspContextMenuModule,
        glspServerCopyPasteModule,
        modelSourceWatcherModule,
        glspCommandPaletteModule,
        paletteModule,
        routingModule,
        glspDecorationModule,
        edgeLayoutModule,
        zorderModule,
        edgeIntersectionModule,
        layoutCommandsModule,
        directTaskEditor,
        navigationModule,
        markerNavigatorModule,
        levelOfDetailModule
    );

    overrideViewerOptions(container, {
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden'
    });

    return container;
}
