/**
 * Created by AnaCris on octubre/14/16.
 */
/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import QueryController from "./QueryController";
import {QueryRequest} from "./QueryController";
import DatasetController from "./DatasetController";
import {Datasets} from "./DatasetController";
import Log from "../Util";


export default class InsightFacade implements IInsightFacade {

    private static datasetController: DatasetController = new DatasetController;
    // private static queryController: QueryController = null;

    constructor(){
        Log.info("InsightFacade::init() ");
        //InsightFacade.datasetController = new DatasetController;
        //let datasets = InsightFacade.datasetController.getDatasets(); // removed this line because it makes PUT 204 impossible to test -S
        //InsightFacade.queryController = new QueryController(datasets);
    }

    public addDataset(id: string, content: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let controller = InsightFacade.datasetController;
            controller.process(id, content).then(function (result: number) {
                Log.trace('InsightFacade::addDataset(..) - processed');
                switch (result) {
                    case 204:
                        fulfill({code: 204});
                        break;
                    case 201:
                        fulfill({code: 201});
                        break;
                    default:
                        //
                }
            }).catch(function (err: Error) {
                Log.trace('InsightFacade::addDataset(..) - ERROR: ' + err.message);
                reject({code: 400, body: {error: err.message}})
                //res.json(400, {err: err.message});
            });
        });
    }

    public removeDataset(id: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let result = InsightFacade.datasetController.deleteDataset(id);
            switch (result) {
                case 204:
                    fulfill({code: 204});
                    break;
                case 404:
                    reject({code: 404});
                    break;
                default:
                   //
            }
        });
    }

    public performQuery(query: QueryRequest): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let datasets: Datasets = InsightFacade.datasetController.getDatasets();
            let controller = new QueryController(datasets);
            let isValid = controller.isValid(query);
            Log.info("InsightFacade :: performQuery(..) - isValid is now:" + isValid);

            switch (isValid) {
                case 200:
                    let result = controller.query(query);
                    fulfill({code: 200, body: result});
                    Log.info("Lenght of result array after performing query: " + result.result.length);
                    break;
                case 424:
                    reject({code: 424, body: {missing: controller.returnWrongIDs()}});
                    break;
                default:
                    reject({code: 400, body: {error: "invalid query"}});
            }
        });
    }
}