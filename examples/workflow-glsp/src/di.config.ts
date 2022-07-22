/********************************************************************************
 * Copyright (c) 2021 EclipseSource and others.
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
import {
    configureDefaultModelElements,
    configureModelElement,
    ConsoleLogger,
    createClientContainer,
    DeleteElementContextMenuItemProvider,
    DiamondNodeView,
    editLabelFeature,
    GLSPGraph,
    GridSnapper,
    LogLevel,
    overrideViewerOptions,
    RectangularNodeView,
    RevealNamedElementActionProvider,
    RoundedCornerNodeView,
    SCompartment,
    SCompartmentView,
    SEdge,
    SLabel,
    SLabelView,
    StructureCompartmentView,
    TYPES
} from '@eclipse-glsp/client';
import { DefaultTypes } from '@eclipse-glsp/protocol';
import 'balloon-css/balloon.min.css';
import { Container, ContainerModule } from 'inversify';
import 'sprotty/css/edit-label.css';
import '../css/diagram.css';
import { directTaskEditor } from './direct-task-editing/di.config';
import { ActivityNode, CategoryNode, Icon, TaskNode, WeightedEdge } from './model';
import { IconView, WorkflowEdgeView, WorkflowSGraphView } from './workflow-views';
import { registerLevelOfDetailRule, registerLevelOfDetailRuleTrigger } from './level-of-detail/level-of-detail';
import { LayoutRule } from './level-of-detail/model/rules/layout-rule';
import { VisibilityRule } from './level-of-detail/model/rules/visibility-rule';
import { LevelOfDetailRuleTriggerContinuous } from './level-of-detail/model/trigger/level-of-detail-rule-trigger-continuous';
import { LevelOfDetailRuleTriggerDiscrete } from './level-of-detail/model/trigger/level-of-detail-rule-trigger-discrete';
import { CssStyleRule } from './level-of-detail/model/rules/css-style-rule';
import { levelOfDetailModule } from './level-of-detail/di.config';

const workflowDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    bind(TYPES.ISnapper).to(GridSnapper);
    bind(TYPES.ICommandPaletteActionProvider).to(RevealNamedElementActionProvider);
    bind(TYPES.IContextMenuItemProvider).to(DeleteElementContextMenuItemProvider);
    const context = { bind, unbind, isBound, rebind };

    configureDefaultModelElements(context);
    configureModelElement(context, DefaultTypes.GRAPH, GLSPGraph, WorkflowSGraphView);
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

    configureModelElement(context, 'category', CategoryNode, RoundedCornerNodeView);
    configureModelElement(context, 'struct', SCompartment, StructureCompartmentView);

    registerLevelOfDetailRule(context, 'lod:rule-visibility', VisibilityRule);
    registerLevelOfDetailRule(context, 'lod:rule-cssstyle', CssStyleRule);
    registerLevelOfDetailRule(context, 'lod:rule-layout', LayoutRule);
    registerLevelOfDetailRuleTrigger(context, 'lod:rule-trigger-continuous', LevelOfDetailRuleTriggerContinuous);
    registerLevelOfDetailRuleTrigger(context, 'lod:rule-trigger-discrete', LevelOfDetailRuleTriggerDiscrete);
});

export default function createContainer(widgetId: string): Container {
    const container = createClientContainer(workflowDiagramModule, directTaskEditor, levelOfDetailModule);
    overrideViewerOptions(container, {
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden'
    });

    return container;
}
