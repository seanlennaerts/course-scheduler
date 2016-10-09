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

export interface Filter {
    LT: {};
    GT: {};
    EQ: {};
    AND: {}[];
    OR: {}[];
    IS: {};
    NOT: {};
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
        //TODO (4):
        // - should check if section id is present in all tempResults arrays
        // - collect the one's that are and set tempResults = [] and store the new result
        for (var obj of arr) {
            this.nextObjectOrArray(<Filter>obj);
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
                if (exists == false) {
                    break; //doesn't exist in one course[] no use checking others
                }
            }
            if (exists == true) {
                filteredResult.push(course);
            }
        }
    }

    private handleOR (arr: {}[]) {
        //TODO (5):
        // - should combine all tempResults arrays into one array
        // - set tempResults = [] and store new result
        for (var obj of arr) {
            this.nextObjectOrArray(<Filter>obj);
        }
        var merged: Course[] = [].concat.apply([], this.tempResults);
        this.tempResults = [];
        this.tempResults.push(merged);

    }

    private handleLT (obj: {}) {
        var key: string = Object.keys(obj)[0].split[1];
        var value: number = Object.values(obj)[0];
        var filteredResult: Course[] = [];
        for (var section of this.datasets["courses"]) {
            if (section.getField(key) < value) {
                filteredResult.push(section);
            }
        }
        this.tempResults.push(filteredResult);
    }

    private handleGT (obj: {}) {
        var key: string = Object.keys(obj)[0].split[1];
        var value: number = Object.values(obj)[0];
        var filteredResult: Course[] = [];
        for (var section of this.datasets["courses"]) {
            if (section.getField(key) > value) {
                filteredResult.push(section);
            }
        }
        this.tempResults.push(filteredResult);
    }

    private handleEQ (obj: {}) {
        var key: string = Object.keys(obj)[0].split[1];
        var value: number = Object.values(obj)[0];
        var filteredResult: Course[] = [];
        for (var section of this.datasets["courses"]) {
            if (section.getField(key) === value) {
                filteredResult.push(section);
            }
        }
        this.tempResults.push(filteredResult);
    }

    private handleIS (keyValue: {}) {

    }

    private handleNOT (keyValue: {}) {

    }


    //TODO(6):
    // - make other handlers, I think we can continue here for now

    // private handleObject (obj: {}) {
    //     switch (Object.keys(obj)[0]) {
    //         case "LT":
    //             this.handleLT(obj);
    //             break;
    //         case "GT":
    //             this.handleGT(obj);
    //             break;
    //         case "EQ":
    //             this.handleEQ(obj);
    //             break;
    //         case "IS":
    //             this.handleIS(obj);
    //             break;
    //         case "NOT":
    //             this.handleNOT(obj);
    //             break;
    //         default:
    //             //
    //     }
    // }
    //
    // private handleArray (array: Array) {
    //     switch (Object.keys(array)[0]) {
    //         case "AND":
    //             this.handleAND(array);
    //             break;
    //         case "OR":
    //             this.handleOR(array);
    //             break;
    //         default:
    //             //
    //     }
    // }

    private nextObjectOrArray (checkObj: Filter) {
        // checkObj = Object.values(Object.keys(checkObj)[0])[0];
        // if (typeof(checkObj) === {}) {
        //     this.handleObject(checkObj);
        // } else {
        //     this.handleArray(checkObj);
        // }

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
        this.nextObjectOrArray (<Filter>query.WHERE);

        var finalTable: {}[] = [];
        var wantedKeys: string[] = [];
        for (var getVariables of query.GET) {
            var wantKey: string = getVariables;
            wantedKeys.push(wantKey);
        }
        for (var course of this.tempResults[0]) {
            var obj: {} = {};
            for (var key of wantedKeys) {
                var keyRight: string = key.split[1];
                obj[key] = course.getField(keyRight);
            }
            finalTable.push(obj);
        }

        var resp: QueryResponse = {render: query.AS, result: finalTable};

        return resp;
    }
}
