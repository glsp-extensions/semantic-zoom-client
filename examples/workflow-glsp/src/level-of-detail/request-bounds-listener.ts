// eslint-disable-next-line header/header
import {SModelRootSchema} from '@eclipse-glsp/client';
import {injectable} from 'inversify';
import {SModelRoot} from 'sprotty';

@injectable()
export class RequestBoundsListener {
    currentBoundsRootSchema: SModelRootSchema;
    currentBoundsRoot: SModelRoot;

    setCurrentBoundsRootSchema(schema: SModelRootSchema): void {
        /*
        this.currentBoundsRootSchema = JSON.parse(
            JSON.stringify(schema)
                .replace(new RegExp('"size":{"width":(\\d+)(\\.\\d+)?,"height":(\\d+)(\\.\\d+)?},?', 'ig'), '')
                .replace(new RegExp('"position":{"x":(\\d+)(\\.\\d+)?,"y":(\\d+)(\\.\\d+)?},?', 'ig'), '')
        );*/
        this.currentBoundsRootSchema = JSON.parse(JSON.stringify(schema));
    }

    setCurrentBoundsRoot(root: SModelRoot): void {
        this.currentBoundsRoot = JSON.parse(JSON.stringify(root));
    }
}
