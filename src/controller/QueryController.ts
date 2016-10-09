/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import Course from "../model/Course";
//import Section from "../model/Section";
import RouteHandler from "../rest/RouteHandler"


export interface QueryRequest {
    GET: string[]; //has to be string array -S
    WHERE: {};
    ORDER?: string; //order is optional -S
    AS: string;
}

export interface QueryResponse {
    result: JSON; //maybe need to change -S
}

export default class QueryController {
    private datasets: Datasets = null;
    private stack: string[] = []; //might need other type, object?
    private tempResults: Course[][] = [];
    private dataset: Course[] = [];
    private queryKeys: string[] = [];
    //private datasetID: string;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
     //   this.datasetID = id;
     //   this.dataset = this.getDataset(id);

    }

    public WHEREhelper(whereObject: {}):boolean {
        if (Object.keys(whereObject).length > 1){
            return false;
        }
        if (!(Object.keys(whereObject)[0] == "LT" || Object.keys(whereObject)[0] == "GT" ||
            Object.keys(whereObject)[0] == "EQ" || Object.keys(whereObject)[0] == "AND" ||
            Object.keys(whereObject)[0] == "OR" || Object.keys(whereObject)[0] == "IS" ||
            Object.keys(whereObject)[0] == "NOT")) {
                return false;
            } else {


            }





        return true;
    }

    public isValid(query: QueryRequest): boolean {
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 3) {
            if (query.GET && query.WHERE && query.AS){
                // GET part of query
                var GETelements = query.GET;
                if (GETelements.length > 0) {
                    for (var i = 0; i < GETelements.length; i++) {
                        var GETelement: string[] = GETelements[i].split("_");
                        var id = GETelement[0];
                        if (!(id in this.datasets)) {
                            return false;
                        } else {
                            var datasetField = GETelement[1];
                            if (!(datasetField == "dept" || datasetField == "id" || datasetField == "avg" ||
                                datasetField == "instructor" || datasetField == "title" ||
                                datasetField == "pass" || datasetField == "fail" || datasetField == "audit")) {
                                return false;
                            } else {
                                this.queryKeys.push(datasetField);
                            }
                        }
                    }
                }
                // AS part of query
                var as = query.AS;
                if (!(as == "TABLE")){
                    return false;
                }
                // ORDER part of query -> OPTIONAL
                if (query.ORDER){
                    for (var key in this.queryKeys){
                        if (query.ORDER == key){
                            this.WHEREhelper(query.WHERE);
                        } else {
                            return false;
                        }
                    }
                }
                return this.WHEREhelper(query.WHERE);
            }
            return false;
        }
        return false;
    }

    public getDataset(id: string): Course[]{
        this.dataset = this.datasets[id];
        return this.dataset;

    }

    private traverseKeys (obj: QueryRequest) {
        //TODO (2):
        // - should perform depth-first traversal of "WHERE" json object
        // - store each key and key value in stack declared above
        if (Object.keys(obj).length == 0) {
            //
        } else {
            var keys: string[] = Object.keys(obj);
            for (var key of keys) {


            }
        }
    }

    private stackHandler (): Course[] {
        //TODO (3):
        // - should pop from stack and pass to appropriate filter
        //  (i.e. if stack has GT first, pass it's values to GT helper)
        //  (need to decide if just declare everything in querycontroller or in other classes, whatever's easier)
        // - the helpers should store results in tempArray
        //  (this way if AND/OR is popped from stack it will be thrown to the AND/OR helpers and they can access past results
        //   and they will empty the tempArray and put their result in tempArray[0] to start over
        // - when stack is empty return the only result in tempResult[0] (hopefully)
        return this.tempResults[0];
    }

    private handleAND (keyValue: string) {
        //TODO (4):
        // - should check if section id is present in all tempResults arrays
        // - collect the one's that are and set tempResults = [] and store the new result
    }

    private handleOR (keyValue: string) {
        //TODO (5):
        // - should combine all tempResults arrays into one array
        // - set tempResults = [] and store new result
    }

    //TODO(6):
    // - make other handlers, I think we can continue here for now

    public query(query: QueryRequest): QueryResponse {
        //stringify turns JS object into JSON string
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        //TODO (7): call all the handlers above and do "GET" and "ORDER" and return result
        this.traverseKeys(query);

        var resp: QueryResponse = {result: JSON};

        return resp;
    }
}
