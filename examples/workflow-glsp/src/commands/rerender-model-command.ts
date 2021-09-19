// eslint-disable-next-line header/header
import {inject, injectable} from 'inversify';
import {
    CommandExecutionContext,
    CommandReturn,
    FeedbackAwareUpdateModelCommand, SModelRootSchema,
    UpdateModelAction
} from '@eclipse-glsp/client';
import {Action, TYPES} from 'sprotty';

@injectable()
export class RerenderModelAction implements UpdateModelAction {
    public readonly _newRoot: SModelRootSchema;
    readonly kind = UpdateModelAction.KIND;

    constructor(
        input: SModelRootSchema,
        public readonly animate: boolean = true,
        public readonly cause?: Action
    ) {
        this._newRoot = input;
    }
}

@injectable()
export class RerenderModelCommand extends FeedbackAwareUpdateModelCommand {

    constructor(@inject(TYPES.Action) protected readonly _action: RerenderModelAction | UpdateModelAction) {
        super(_action instanceof RerenderModelAction ?
            new UpdateModelAction({ type: 'graph', id: 'sprotty'}, _action.animate, _action.cause) :
            _action
        );
    }

    execute(context: CommandExecutionContext): CommandReturn {
        if(this._action instanceof RerenderModelAction) {
            console.log('rerender command');
            this.oldRoot = context.root;
            this.newRoot = context.modelFactory.createRoot(this._action._newRoot);
            return this.performUpdate(this.oldRoot, this.newRoot, context);
        } else {
            console.log('update command');
            return super.execute(context);
        }
    }
}
