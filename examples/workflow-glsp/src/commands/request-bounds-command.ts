// eslint-disable-next-line header/header
import { inject, injectable } from 'inversify';
import { CommandExecutionContext, CommandResult } from 'sprotty';
import { RequestBoundsCommand } from '@eclipse-glsp/client';
import { WORKFLOW_TYPES } from '../workflow-types';
import { RequestBoundsListener } from '../level-of-detail/request-bounds-listener';

@injectable()
export class WorkflowRequestBoundsCommand extends RequestBoundsCommand {

    @inject(WORKFLOW_TYPES.RequestBoundsListener)
    requestBoundsListener: RequestBoundsListener;

    execute(context: CommandExecutionContext): CommandResult {
        this.requestBoundsListener.setCurrentBoundsRootSchema(this.action.newRoot);
        console.log('requestboundscommand');

        const model = context.modelFactory.createRoot(this.action.newRoot);

        return {
            model: model,
            modelChanged: true,
            cause: this.action
        };
    }
}
