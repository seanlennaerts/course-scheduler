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
    private wrongDatasetIDs: string[] = [];

    constructor(datasets: Datasets) {
        this.datasets = datasets;
     //   this.datasetID = id;
     //   this.dataset = this.getDataset(id);

    }

    public returnWrongIDs(): string[]{
        return this.wrongDatasetIDs
    }

    private WHEREhelperArray(array:{}[]): number {
        var resultNumbers :number[] = [];
        for(var i of array){
            resultNumbers.push(this.WHEREhelperObject(i));
        }
        if (resultNumbers.indexOf(400,0) === -1){
            Log.info("QueryController :: WHEREhelperArray(..) - Array of objects all return 200!");
            return 200;
        }else{
            Log.info("QueryController :: WHEREhelperArray(..) - At least one object in the array returns 400");
            return 400;
        }
    }

    private objectOrArrayValid (checkObj: any): number {
        if (typeof(checkObj) === {}) {
            Log.info("QueryController :: objectOrArrayValid(..) - it's an object, now going to the helper");
            return this.WHEREhelperObject(checkObj);
        } else {
            Log.info("QueryController :: objectOrArrayValid(..) - it's an array, now going to helper");
            return this.WHEREhelperArray(checkObj);
        }
    }

    private WHEREhelperObject(whereObject: {}): number {
        let that = this;
        // section 1
        if (Object.keys(whereObject).length > 1){
            Log.info("QueryController :: WHEREhelperObject(..) - Object has more than one key");
            return 400;
        }
        // section 2
        // check if the object key is one of the permitted course keys
        if (Object.keys(whereObject)[0].split("_")[1] === "dept" || Object.keys(whereObject)[0].split("_")[1]  === "id" ||
                Object.keys(whereObject)[0].split("_")[1]  === "avg" || Object.keys(whereObject)[0].split("_")[1]  === "instructor" ||
                Object.keys(whereObject)[0].split("_")[1]  === "title" || Object.keys(whereObject)[0].split("_")[1]  === "pass" ||
                Object.keys(whereObject)[0].split("_")[1]  === "fail"){
            Log.info("QueryController :: WHEREhelperObject(..) - reached base case (no more nested objects/arrays), object key is " + Object.keys(whereObject)[0]);
            return 200;
        }
        // section 3
        // check if the keys in first level are the LOGIC operators allowed
        // TODO: when object operators are not the given ones
        if (Object.keys(whereObject)[0] === "LT" || Object.keys(whereObject)[0] === "GT" ||
            Object.keys(whereObject)[0] === "EQ" ||  Object.keys(whereObject)[0] === "IS" ||
            Object.keys(whereObject)[0] === "NOT") {
            var objectKey: string = Object.keys(whereObject)[0];
            var secondLevel: {} = whereObject[objectKey];
            Log.info("QueryController :: WHEREhelperObject(..) - about to go in a level deeper recursively, with this object: " + JSON.stringify(secondLevel));
            return that.WHEREhelperObject(secondLevel);
        }
        else if (Object.keys(whereObject)[0] === "AND" || Object.keys(whereObject)[0] === "OR"){
            var objectKey: string = Object.keys(whereObject)[0];
            var secondLevelArray: {}[] = whereObject[objectKey];
            Log.info("QueryController :: WHEREhelperObject(..) - about to go in a level deeper recursively, with this array: " + JSON.stringify(secondLevel));
            return that.WHEREhelperArray(secondLevelArray);
        } else{
            Log.info("QueryController :: WHEREhelperObject(..) - about to return errors, these object keys are not proper operators: " + Object.keys(whereObject)[0]);
            return 400;
        }
    }

    public isValid(query: QueryRequest): number {
        let that = this;
        if (typeof query !== 'undefined' && query !== null && Object.keys(query).length >= 3) {
            if (query.GET && query.WHERE && query.AS) {
                // GET part of query
                var GETelements: string[] = query.GET;
                Log.info("QueryController :: isValid(..) - GETelements are: " + JSON.stringify(GETelements));
                if (GETelements.length > 0) {
                    for (var i = 0; i < GETelements.length; i++) {
                        var GETelement: string[] = GETelements[i].split("_");
                        var id: string = GETelement[0];
                        Log.info("QueryController :: isValid(..) - id is: " + id);
                        if (!(id in that.datasets)) {
                            that.wrongDatasetIDs.push(id);
                            Log.info("QueryController :: isValid(..) - about to return 424 error: " + id + "hasn't been put");
                            Log.info("QueryController :: isValid(..) - the wrongDatasetIDS are " + JSON.stringify(this.wrongDatasetIDs));
                            return (424);
                        } else {
                            Log.info("QueryController :: isValid(..) - id has been put in datasets");
                            var datasetField = GETelement[1];
                            Log.info("QueryController :: isValid(..) - datasetField is: " + datasetField);
                            if (!(datasetField === "dept" || datasetField === "id" || datasetField === "avg" ||
                                datasetField === "instructor" || datasetField === "title" ||
                                datasetField === "pass" || datasetField === "fail" || datasetField === "audit")) {
                                Log.info("QueryController :: isValid(..) - wrong field in query submitted ");
                                return 400;
                            } else {
                                Log.info("QueryController :: isValid(..) - pushing datasetField: " + datasetField);
                                this.queryKeys.push(datasetField);
                            }
                        }
                    }
                }
                // AS part of query
                var as = query.AS;
                if (!(as == "TABLE")) {
                    Log.info("QueryController :: isValid(..) - AS is other than 'TABLE'");
                    return 400;
                }
                Log.info("QueryController :: isValid(..) - AS is'TABLE' :) ");
                // ORDER part of query -> OPTIONAL
                if (query.ORDER) {
                    Log.info("QueryController :: isValid(..) - ORDER key is:" + query.ORDER);
                    if (this.queryKeys.indexOf(query.ORDER, 0) == -1) {
                        Log.info("QueryController :: isValid(..) - " + query.ORDER + " key is not included in GET keys");
                        return 400;
                    } else {
                        Log.info("QueryController :: isValid(..) - there is ORDER key included in GET keys, going to WHERE helper ");
                        return this.WHEREhelperObject(query.WHERE);
                    }
                } else {
                    Log.info("QueryController :: isValid(..) - no ORDER key, query is now going to  WHEREhelperObject");
                    return this.WHEREhelperObject(query.WHERE);
                }
            }
            Log.info("QueryController :: isValid(..) - query doesn't include GET, WHERE, AS");
            return 400;
        }
        Log.info("QueryController :: isValid(..) - query is either undefined, null, or keys are less than 3 ");
        return 400;
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
