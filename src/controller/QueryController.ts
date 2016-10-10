/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import Course from "../model/Course";

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
            Log.info("QueryController :: WHEREhelperObject(..) - about to go in a level deeper recursively, with this array: " + JSON.stringify(secondLevelArray));
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
                            Log.info("QueryController :: isValid(..) - about to return 424 error: " + id + " hasn't been put");
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
                    if (this.queryKeys.indexOf(query.ORDER.split("_")[1], 0) == -1) {
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
        this.tempResults = [];
        this.tempResults.push(filteredResult);
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

    private handleIS (obj: {}) {
        Log.info("QueryController:: handleIS(" + JSON.stringify(obj) + ")");
        var keyFull: string = Object.keys(obj)[0];
        var value: string = obj[keyFull];
        var keyRight: string = keyFull.split("_")[1];
        var filteredResult: Course[] = [];

        // case4: value = *adhe*
        Log.info("it is case4");
        if (value.indexOf("*") == 0 && value.lastIndexOf("*") == (value.length - 1)){
            var trimmedStr: string = value.substr(1,(value.length-2));
            Log.info("* is at the beggining AND end: stripping value of stars leaves only: " + trimmedStr);
            for (var section of this.datasets["courses"]) {
                if (typeof section.getField(keyRight) === "string") {
                    var str: string = <string>section.getField(keyRight);
                    Log.info("str has: " + str);
                    if (str.includes(trimmedStr)){
                        Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
                        filteredResult.push(section);
                    }
                }
            }
        }
        // case1: value = *adhe
        //Log.info("it is case1");
        else if (value.indexOf("*") == 0){
            var trimmedStr: string = value.substr(1, (value.length - 1));
            Log.info("* is in the beginning: stripping value of stars leaves only: " + trimmedStr);
            for (var section of this.datasets["courses"]) {
                if (typeof section.getField(keyRight) === "string") {
                    var str: string = <string>section.getField(keyRight);
                    if (str.endsWith(trimmedStr)){
                        Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
                        filteredResult.push(section);
                    }
                }
            }
        }
        // case3: value = adhe*
        else if (value.lastIndexOf("*") == value.length - 1){
            var trimmedStr: string = value.split("*")[0];
            Log.info("* is at the end: stripping value of stars leaves only: " + trimmedStr);
            for (var section of this.datasets["courses"]) {
                if (typeof section.getField(keyRight) === "string") {
                    var str: string = <string>section.getField(keyRight);
                    Log.info("str has: " + str);
                    if (str.startsWith(trimmedStr)){
                        Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
                        filteredResult.push(section);
                    }
                }
            }
        } else {
            // case2: value = adhe
            Log.info("it is case2");
            if (!(value.includes("*"))) {
                for (var section of this.datasets["courses"]) {
                    if (section.getField(keyRight) === value) {
                        Log.info("handleIS() pushed " + section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
                        filteredResult.push(section);
                    }
                }
            }
        }
        this.tempResults.push(filteredResult);
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
