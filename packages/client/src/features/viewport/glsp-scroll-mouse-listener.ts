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
import { Action } from '@eclipse-glsp/protocol';
import { injectable } from 'inversify';
import { EnableDefaultToolsAction, EnableToolsAction, IActionHandler, ICommand, ScrollMouseListener, SModelElement } from 'sprotty';
import { MarqueeMouseTool } from '../tools/marquee-mouse-tool';

@injectable()
export class GLSPScrollMouseListener extends ScrollMouseListener implements IActionHandler {
    preventScrolling = false;

    handle(action: Action): void | Action | ICommand {
        if (action instanceof EnableToolsAction) {
            if (action.toolIds.includes(MarqueeMouseTool.ID)) {
                this.preventScrolling = true;
            }
        } else if (action instanceof EnableDefaultToolsAction) {
            this.preventScrolling = false;
        }
    }

    mouseDown(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        if (this.preventScrolling) {
            return [];
        }
        return super.mouseDown(target, event);
    }
}
