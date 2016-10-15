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

    private static datasetController = new DatasetController;
    private static queryController: QueryController = null;

    constructor(){
        Log.info("InsightFacade::init() ");
        let datasets = InsightFacade.datasetController.getDatasets();
        InsightFacade.queryController = new QueryController(datasets);
    }


    public addDataset(id: string, content: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let controller = InsightFacade.datasetController;
            controller.process(id, content).then(function (result) {
                Log.trace('InsightFacade::addDataset(..) - processed');
                if (result === 204) {
                    fulfill({code: 204, body:{}});
                    // res.json(result, {success: "ID is new and was added to dataset succesfully!"});
                } else if (result === 201) {
                    fulfill({code: 201, body:{}});
                    //res.json(result, {success: "ID is not new and was added to dataset succesfully!"});
                } else {
                    fulfill({code: 200, body:{}});
                    //res.json(200, {success: result});
                    Log.info("InsightFacade::addDataset VALID QUERY!! :D");
                }
            }).catch(function (err: Error) {
                Log.trace('InsightFacade::addDataset(..) - ERROR: ' + err.message);
                reject({code: 400, err: err.message})
                //res.json(400, {err: err.message});
            });
        });
        // TODO#1
    }
    public removeDataset(id: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            var successfulDelete: boolean = InsightFacade.datasetController.deleteDataset(id);
            if (successfulDelete){
                fulfill({code: 204, body:{}});
            } else{
                reject({code: 404, body:{}});
            }
        });
        // TODO#2
    }
    public performQuery(query: QueryRequest): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let datasets: Datasets = InsightFacade.datasetController.getDatasets();
            let controller = new QueryController(datasets);
            let isValid = controller.isValid(query);
            Log.info("InsightFacade :: performQuery(..) - isValid is now:" + isValid);

            if (isValid === 200) {
                let result = controller.query(query);
                fulfill(200, result);
            } else if (isValid === 424) {
                reject(424, "missing " + controller.returnWrongIDs());
            } else {
                reject(400, {error: 'invalid query'})
            };
        });
        // TODO#3
    }



}