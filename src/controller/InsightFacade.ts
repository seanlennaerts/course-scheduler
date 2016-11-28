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
import {QueryResponse} from "./QueryController";
import Course from "../model/Course";
import {DistanceRequest, default as DistanceController, DistanceResponse} from "./DistanceController";

export default class InsightFacade implements IInsightFacade {

    private static datasetController: DatasetController = new DatasetController;
    // private static queryController: QueryController = null;

    constructor() {
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
                fulfill({code: result, body: {}});
            }).catch(function (error: Error) {
                Log.trace('InsightFacade::addDataset(..) - ERROR: ' + error.message);
                reject({code: 400, body: {error: error.message}});
            });
        });
    }

    public removeDataset(id: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let result = InsightFacade.datasetController.deleteDataset(id);
            switch (result) {
                case 204:
                    fulfill({code: 204, body: {}});
                    break;
                case 404:
                    reject({code: 404, body: {}});
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
                    let result: QueryResponse = controller.query(query);
                    Log.info("Lenght of result array after performing query: " + result.result.length);
                    fulfill({code: 200, body: result});
                    break;
                case 424:
                    reject({code: 424, body: {missing: controller.returnWrongIDs()}});
                    break;
                default:
                    reject({code: 400, body: {error: "Invalid query"}});
            }
        });
    }

    public checkDistance(query: DistanceRequest): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject) {
            try {
                let datasets: Datasets = InsightFacade.datasetController.getDatasets();
                let controller = new DistanceController(datasets);
                let result: DistanceResponse = controller.getBuildingsInRange(query);
                fulfill({code: 200, body: result});
            } catch (err) {
                reject({code: 400, body: {error: "Something went wrong"}});
            }
        })
    }

    public addSchedulizerInput(input): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject) {
            // let controller = InsightFacade.datasetController;
            // controller.process(id, content).then(function (result: number) {
            //     Log.trace('InsightFacade::addDataset(..) - processed');
            //     fulfill({code: result, body: {}});
            // }).catch(function (error: Error) {
            //     Log.trace('InsightFacade::addDataset(..) - ERROR: ' + error.message);
            //     reject({code: 400, body: {error: error.message}});
            // });
        })
    }
}