/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import Course from "../model/Course";
import RouteHandler from "../rest/RouteHandler"
import {type} from "os";
import {handle} from "typings/dist/support/cli";


export interface QueryRequest {
    GET: string[]; //has to be string array -S
    WHERE: {};
    ORDER?: string; //order is optional -S
    AS: string;
}

export interface QueryResponse {
    render: string
    result: {}[];
}

export default class QueryController {
    private datasets: Datasets = null;
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

    private handleAND (arr: {}[]) {
        Log.info("handleAND(" + JSON.stringify(arr) + ")");

        //TODO (4):
        // - should check if section id is present in all tempResults arrays
        // - collect the one's that are and set tempResults = [] and store the new result
        for (var obj of arr) {
            this.nextObjectOrArray(obj);
        }
        var filteredResult: Course[] = [];
        for (var course of this.tempResults[0]) {
            var id: number = course.uniqueId;
            var exists: boolean = false;
            for (var i = 1; i < this.tempResults.length; i++) {
                exists = false;
                for (var checkCourse of this.tempResults[i]) {
                    if (checkCourse.uniqueId === id) {
                        //found. no use checking other courses in this list
                        exists = true;
                        break; //go to next course array in tempResults
                    }
                    //else: not found. continue looking in this array
                }
                if (!exists) {
                    break; //doesn't exist in one course[] no use checking others
                }
            }
            if (exists) {
                filteredResult.push(course);
            }
        }
    }

    private handleOR (arr: {}[]) {
        Log.info("handleOR(" + JSON.stringify(arr) + ")");
        //TODO (5):
        // - should combine all tempResults arrays into one array
        // - set tempResults = [] and store new result
        for (var obj of arr) {
            this.nextObjectOrArray(obj);
        }
        var merged: Course[] = [].concat.apply([], this.tempResults);
        this.tempResults = [];
        this.tempResults.push(merged);

    }


    private handleNOT (obj: {}) {
        Log.info("handleNOT(" + JSON.stringify(obj) + ")");
        //var keyFull: string = Object.keys(obj)[0];
        this.nextObjectOrArray(obj);
        var resultArray: Course[] = [];
        var exists: boolean = false;
        Log.info("entering for loop in handlNOT");
        for (var section of this.datasets["courses"]) {
            var id: number = section.uniqueId;
            Log.info("entering second for loop in handleNOT");
            Log.info("tempResults length in handleNOT:" + this.tempResults.length);
            for (var checkCourse of this.tempResults[0]){
                if (checkCourse.uniqueId === id) {
                    exists = true;
                }
            }
            if (!exists) {
                resultArray.push(section);
            }
        }
        this.tempResults = [];
        this.tempResults.push(resultArray);
    }

    private handleLT (obj: {}) {
        Log.info("handleLT(" + JSON.stringify(obj) + ")");
        var keyFull: string = Object.keys(obj)[0];
        var value: number = obj[keyFull];
        var keyRight = keyFull.split("_")[1];
        var filteredResult: Course[] = [];
        for (var section of this.datasets["courses"]) {
            if (section.getField(keyRight) < value) {
                filteredResult.push(section);
                //Log.info("handleGT() pushed " + section.getField("dept") + section.getField("id") + "-" + section.uniqueId + ", avg: " + section.getField("avg"));
            }
        }
        this.tempResults.push(filteredResult);
    }

    private handleGT (obj: {}) {
        Log.info("handleGT(" + JSON.stringify(obj) + ")");
        var keyFull: string = Object.keys(obj)[0];
        var value: number = obj[keyFull];
        var keyRight = keyFull.split("_")[1];
        var filteredResult: Course[] = [];
        for (var section of this.datasets["courses"]) {
            if (section.getField(keyRight) > value) {
                filteredResult.push(section);
                //Log.info("handleGT() pushed " + section.getField("dept") + section.getField("id") + "-" + section.uniqueId + "-" + section.getField("avg"));
            }
        }
        this.tempResults.push(filteredResult);
        Log.info("tempResults length after handleGT:" + this.tempResults.length);
    }

    private handleEQ (obj: {}) {
        Log.info("handleEQ(" + JSON.stringify(obj) + ")");
        var keyFull: string = Object.keys(obj)[0];
        var value: number = obj[keyFull];
        var keyRight: string = keyFull.split("_")[1];
        var filteredResult: Course[] = [];
        for (var section of this.datasets["courses"]) {
            if (section.getField(keyRight) === value) {
                filteredResult.push(section);
                Log.info("handleGT() pushed " + section.getField("dept") + section.getField("id") + "-" + section.uniqueId + "-" + section.getField("avg"));
            }
        }
        this.tempResults.push(filteredResult);
        Log.info("tempResults: ");
        for (var temp of filteredResult) {
            Log.info(<string>temp.getField("dept"));
        }
    }

    private handleIS (keyValue: {}) {

    }


    private nextObjectOrArray (checkObj: any) {
        Log.info("nextObjectOrArray(" + JSON.stringify(checkObj) + ")");

        if (checkObj.AND) {
            this.handleAND(checkObj.AND);
        } else if (checkObj.OR) {
            this.handleOR(checkObj.OR);
        } else if (checkObj.LT) {
            this.handleLT(checkObj.LT);
        } else if (checkObj.GT) {
            this.handleGT(checkObj.GT);
        } else if (checkObj.EQ) {
            this.handleEQ(checkObj.EQ);
        } else if (checkObj.IS) {
            this.handleIS(checkObj.IS);
        } else if (checkObj.NOT) {
            this.handleNOT(checkObj.NOT);
        } else {
            //
        }
    }

    public query(query: QueryRequest): QueryResponse {
        //stringify turns JS object into JSON string
        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        //TODO (7): call all the handlers above and do "GET" and "ORDER" and return result
        this.nextObjectOrArray (query.WHERE);

        var finalTable: {}[] = [];
        var wantedKeys: string[] = [];
        for (var getVariables of query.GET) {
            var wantKey: string = getVariables;
            wantedKeys.push(wantKey);
        }
        for (var course of this.tempResults[0]) {
            var obj: {} = {};
            for (var key of wantedKeys) {
                var keyRight: string = key.split("_")[1];
                obj[key] = course.getField(keyRight);
                //Log.info("Check it out!: " + obj[key]);
            }
            finalTable.push(obj);
        }
        // for (var temp of finalTable) {
        //     Log.info(temp.toString());
        // }
        Log.info("FINISHED QUERY SUCCESFULLY! :D");

        var resp: QueryResponse = {render: query.AS, result: finalTable};

        return resp;
    }
}
