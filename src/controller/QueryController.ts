/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import Course from "../model/Course";
import Section from "../model/Section";
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

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    public isValid(query: QueryRequest): boolean {
        //TODO (1): WORK ON VALIDATING QUERY

        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length > 0) {
            return true;
        }
        return false;
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

        let id = query.GET[0].split("_");
        var dataset: Course[] = this.datasets[id];

        if (query.GET) {}

        return resp;
    }
}
