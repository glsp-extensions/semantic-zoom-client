// eslint-disable-next-line header/header
import {SModelRootSchema} from '@eclipse-glsp/client';
import {injectable} from 'inversify';

@injectable()
export class RequestBoundsListener {
    currentBoundsRootSchema: SModelRootSchema;

    setCurrentBoundsRootSchema(schema: SModelRootSchema): void {
        /*
        this.currentBoundsRootSchema = JSON.parse(
            JSON.stringify(schema)
                .replace(new RegExp('"size":{"width":(\\d+)(\\.\\d+)?,"height":(\\d+)(\\.\\d+)?},?', 'ig'), '')
                .replace(new RegExp('"position":{"x":(\\d+)(\\.\\d+)?,"y":(\\d+)(\\.\\d+)?},?', 'ig'), '')
        );*/
        this.currentBoundsRootSchema = JSON.parse(JSON.stringify(schema));
    }
}
