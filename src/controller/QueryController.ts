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
                let datasetField = indivSearchQuery[1];


                let dataset:{} = this.datasets[datasetID];
                for(dataset.keys in dataset ){

                }
                dataset.Subject
            }


            for (dataset in ){
                this.datasets[]
               ;


            }


        }



        return {status: 'received', ts: new Date().getTime()};
    }
}
