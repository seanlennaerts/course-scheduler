/**
 * Created by AnaCris on octubre/14/16.
 */
/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import {QueryRequest, default as QueryController} from "./QueryController";
import DatasetController from "./DatasetController";
import Log from "../Util";

export default class InsightFacade implements IInsightFacade {

    private static datasetController = new DatasetController;
    private static queryController: QueryController = null;

    constructor(){
        Log.info("InsightFacade::init() ");
        //static vs non static?
        let datasets = InsightFacade.datasetController.getDatasets();
        InsightFacade.queryController = new QueryController(datasets);
    }


    addDataset(id: string, content: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject));
        // TODO#1
    }
    removeDataset(id: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject));
        // TODO#2
    }
    performQuery(query: QueryRequest): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject));
        // TODO#3
    }



}