/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import Course from "../model/Course";
import Section from "../model/Section";
import RouteHandler from "../rest/RouteHandler"


export interface QueryRequest {
    GET: string|string[];
    WHERE: {};
    ORDER: string;
    AS: string;
   // OR: [{}];   //how to declare an array of objects?
   // AND: [{}];
}

export interface QueryResponse {
    result: number;
    error: String;
}

export default class QueryController {
    private datasets: Datasets = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
    }

    public query(query: QueryRequest): QueryResponse {
        //stringify turns JS object into JSON string
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        // TODO: implement this
        var resp: QueryResponse = {result:0, error:''};

        // get appropriate dataset we want to query from datasets

        if (query.GET){
            var searchQueries = query.GET;
            for(var i = 0; i <searchQueries.length; i++){
                let indivSearchQuery: string[] = searchQueries[i].split("_");
                let datasetID = indivSearchQuery[0];
                let datasetField = "_" +indivSearchQuery[1];


                let dataset: {} = this.datasets[datasetID];
                //First element in JSON object is "result" folder, why can't I say dataset.result.
                //check to see if dataset is not empty!
                if (dataset[0].length > 0){
                    //check if key is in object
                    if (datasetField in dataset[0]){
                        if (datasetField == "_dept" || datasetField == "_id" || datasetField == "_title"){
                            //calls getter functions
                            var tempField = dataset[0].datasetField;
                        } else {
                            var tempField = dataset[0].sections.datasetField;
                        }

                    }
                    resp.result[0] = tempField;
                }
            }


        }



      //  return {status: 'received', ts: new Date().getTime()};
    }
}
