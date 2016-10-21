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
    render: string;
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
        return this.wrongDatasetIDs;
    }

    private WHEREhelperArray(array:{}[]): number {
        var resultNumbers :number[] = [];
        for(var i of array){
            var tempNumber: number = this.WHEREhelperObject(i);
            //Log.info("this is tempNumber: " + tempNumber);
            resultNumbers.push(tempNumber);
            if (tempNumber === 400){
                return 400;
            }
            if (tempNumber === 424){
                return 424;
            }
        }
        return 200;
    }

    private WHEREhelperObject(whereObject: {}): number {
        if (Object.keys(whereObject).length > 1 || Object.keys(whereObject).length === 0 ){
            //Log.info("QueryController :: WHEREhelperObject(..) - Object has more than one key or is empty");
            return 400;
        }
        // check if the object of type: id_field is permitted
        if (Object.keys(whereObject)[0].includes("_")) {
            var id = Object.keys(whereObject)[0].split("_")[0];
            //Log.info("this is id right now: " + id);
            if (!(id in this.datasets)) {
                this.wrongDatasetIDs.push(id);
               // Log.info("wrongDataSetIDs[0] is: " + this.wrongDatasetIDs[0]);
                return 424;
            } else {
                if (Object.keys(whereObject)[0].split("_")[1] === "dept" || Object.keys(whereObject)[0].split("_")[1] === "id" ||
                    Object.keys(whereObject)[0].split("_")[1] === "avg" || Object.keys(whereObject)[0].split("_")[1] === "instructor" ||
                    Object.keys(whereObject)[0].split("_")[1] === "title" || Object.keys(whereObject)[0].split("_")[1] === "pass" ||
                    Object.keys(whereObject)[0].split("_")[1] === "fail"|| Object.keys(whereObject)[0].split("_")[1] === "audit") {
                    //Log.info("QueryController :: WHEREhelperObject(..) - reached base case (no more nested objects/arrays), object key is " + Object.keys(whereObject)[0]);
                    return 200;
                }
            }
        }
       // }
        // check LOGIC operators
        if (Object.keys(whereObject)[0] === "LT" || Object.keys(whereObject)[0] === "GT" || Object.keys(whereObject)[0] === "EQ" ||
            Object.keys(whereObject)[0] === "IS" || Object.keys(whereObject)[0] === "NOT") {
            var objectKey: string = Object.keys(whereObject)[0];
            var secondLevel: {} = (<any>whereObject)[objectKey];
            //Log.info("QueryController :: WHEREhelperObject(..) - about to go in a level deeper recursively, with this object: " + JSON.stringify(secondLevel));
            return this.WHEREhelperObject(secondLevel);
        }
        else if (Object.keys(whereObject)[0] === "AND" || Object.keys(whereObject)[0] === "OR"){
            var objectKey: string = Object.keys(whereObject)[0];
            var secondLevelArray: {}[] = (<any>whereObject)[objectKey];
            //Log.info("QueryController :: WHEREhelperObject(..) - about to go in a level deeper recursively, with this array: " + JSON.stringify(secondLevelArray));
            return this.WHEREhelperArray(secondLevelArray);
        } else{
            //Log.info("QueryController :: WHEREhelperObject(..) - about to return errors, these object keys are not proper operators: " + Object.keys(whereObject)[0]);
            return 400;
        }
    }

    public isValidOrderHandler(orderString: string): number {
        //Log.info("QueryController :: isValidOrderHandler(..) - ORDER key is:" + orderString);
        if (orderString.length === 0){
            return 400;
        } if (!(orderString.includes("_"))){
            return 400;
        } else {
            // it used to be: (this.queryKeys.indexOf(orderString.split("_")[1], 0) == -1)
            if (!(orderString.split("_")[0] in this.datasets)){
                this.wrongDatasetIDs[0] = orderString.split("_")[0];
                //Log.info("QueryController :: isValidOrderHandler(..) - ORDER id is: not in datasets: " + orderString.split("_")[0]);
                return 424;
            }
            if (this.queryKeys.indexOf(orderString.split("_")[1]) === -1) {
                //Log.info("QueryController :: isValidOrderHandler(..) - " + orderString + " key is not included in GET keys");
                return 400;
            } else {
                //Log.info("QueryController :: isValidOrderHandler(..) - there is ORDER key included in GET keys ");
                return 200;
            }
        }
    }

    public isValidAsHandler(asString: string): number{
        if (asString.length === 0) {
            return 400;
        }
        if (!(asString == "TABLE")) {
            //Log.info("QueryController :: isValidAsHandler(..) - AS is other than 'TABLE'");
            return 400;
        } else {
            //Log.info("QueryController :: isValidAsHandler(..) - AS is'TABLE' :) ");
            return 200;
        }
    }

    public isValidGetHandler(getArray:string[]): number{
        if (getArray.length <= 0) {
            return 400;
        } else {
            for (var i = 0; i < getArray.length; i++) {
                if (!(getArray[i].includes("_"))){
                    return 400;
                }
                var GETelement: string[] = getArray[i].split("_");
                var id: string = GETelement[0];
                //Log.info("QueryController :: isValidGetHandler(..) - id is: " + id);
                if (!(id in this.datasets)) {
                    this.wrongDatasetIDs.push(id);
                    //Log.info("QueryController :: isValidGetHandler(..) - 424 error: " + id + " hasn't been put");
                    //Log.info("QueryController :: isValidGetHandler(..) - the wrongDatasetIDS are " + JSON.stringify(this.wrongDatasetIDs));
                    return (424);
                } else {
                    //Log.info("QueryController :: isValidGetHandler(..) - id is already in datasets");
                    var datasetField = GETelement[1];
                    //Log.info("QueryController :: isValidGetHandler(..) - datasetField is: " + datasetField);
                    if (!(datasetField === "dept" || datasetField === "id" || datasetField === "avg" ||
                        datasetField === "instructor" || datasetField === "title" ||
                        datasetField === "pass" || datasetField === "fail" || datasetField === "audit")) {
                        //Log.info("QueryController :: isValidGetHandler - wrong field in query submitted ");
                        return 400;
                    } else {
                        //Log.info("QueryController :: isValidGetHandler - pushing datasetField: " + datasetField);
                        this.queryKeys.push(datasetField);
                    }
                }
            }
            return 200;
        }
    }

    public isValid(query: QueryRequest): number {
        if (typeof query !== 'undefined' && query !== null ) {
            if (query.GET && query.WHERE && query.AS) {
                // GET part of query
                var GETelements: string[] = query.GET;
               // Log.info("QueryController :: isValid(..) - GETelements are: " + JSON.stringify(GETelements) + "going into isValidGetHandler");
                var GETresult = this.isValidGetHandler(GETelements);
                if (GETresult === 200){
                    var ASresult = this.isValidAsHandler(query.AS);
                    if (ASresult === 200){
                        // ORDER is optional
                        if (query.ORDER === ""){
                            return 400;
                        }
                        if (query.ORDER){
                            var ORDERresult = this.isValidOrderHandler(query.ORDER);
                            //Log.info("isValid(..) - returned from isValidOrderHandler, ORDERresult: " + ORDERresult);
                            if(ORDERresult === 200) {
                                return this.WHEREhelperObject(query.WHERE);
                            } else {
                                return ORDERresult;
                            }
                        } else {
                            //Log.info("QueryController :: isValid(..) - no ORDER key, query is now going to  WHEREhelperObject");
                            return this.WHEREhelperObject(query.WHERE);
                        }
                    } else {
                        return ASresult;
                    }
                } else {
                    return GETresult;
                }
            }
            //Log.info("QueryController :: isValid(..) - query doesn't include GET, WHERE, AS");
            return 400;
        }
        //Log.info("QueryController :: isValid(..) - query is either undefined, null" );
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
        // var that = this;
        //
        Log.info("handleNOT(" + JSON.stringify(obj) + ")");
        this.nextObjectOrArray(obj);
        Log.info("handleNOT() ... returned form handling inner filter")
        //
        // var tempMaster: Course[] = that.datasets["courses"];
        // tempMaster.filter(function removeSomeCourses(course: Course) {
        //     for (var courseTemp of that.tempResults[0]) {
        //         if (courseTemp.uniqueId === course.uniqueId) {
        //             Log.info("Found course we don't want: " + JSON.stringify(course));
        //             return false;
        //         }
        //     }
        //     Log.info("Adding course we want in final array: " + JSON.stringify(course));
        //     return true;
        // });
        // that.tempResults = [];
        // that.tempResults.push(tempMaster);

        var tempMaster: Course[] = this.datasets["courses"];
        var filteredResult: Course[] = [];
        //Log.info("Size of master array: " + tempMaster.length);
        //Log.info("Size of array after filter: " + this.tempResults[0].length);
        for (var c1 of tempMaster) {
            var exists: boolean = false;
            for (var c2 of this.tempResults[0]) {
                if (c1.uniqueId === c2.uniqueId) {
                    exists = true;
                    //Log.info("Removing class: " +  JSON.stringify(c1));
                }
            }
            if (!exists) {
                //Log.info("Keeping class: " + JSON.stringify(c1));
                filteredResult.push(c1);
            }
        }
        this.tempResults = [];
        this.tempResults.push(filteredResult);
    }

    private handleLT (obj: {}) {
        Log.info("handleLT(" + JSON.stringify(obj) + ")");
        var keyFull: string = Object.keys(obj)[0];
        var value: number = (<any>obj)[keyFull];
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
        var value: number = (<any>obj)[keyFull];
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
        var value: number = (<any>obj)[keyFull];
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
        var value: string = (<any>obj)[keyFull];
        var keyRight: string = keyFull.split("_")[1];
        var filteredResult: Course[] = [];
       // if (Object.keys(obj)[0] === "instructor"){
       // }
        // case1: value = *adhe*
        if (value.indexOf("*") === 0 && value.lastIndexOf("*") == (value.length - 1)){
           // Log.info("it is case4");
            var trimmedStr: string = value.substr(1,(value.length-2));
            //Log.info("* is at the beggining AND end: stripping value of stars leaves only: " + trimmedStr);
            for (var section of this.datasets["courses"]) {
                if(keyRight === "instructor") {
                    //Log.info("It should be an instructor that we are looking for: " + trimmedStr);
                    var strings: string[] = section.getInstructors();
                    for(var s of strings){
                        //Log.info(strings[s]);
                        if (s.includes(trimmedStr)){
                           // Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since instructor contains" + trimmedStr);
                            filteredResult.push(section);
                        }
                    }
                } else if (typeof section.getField(keyRight) === "string") {
                    var str: string = <string>section.getField(keyRight);
                   // Log.info("str has: " + str);
                    if (str.includes(trimmedStr)){
                       // Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
                        filteredResult.push(section);
                    }
                }
            }
        }
        // case2: value = *adhe
        else if (value.indexOf("*") === 0){
            //Log.info("it is case1");
            var trimmedStr: string = value.substr(1, (value.length - 1));
            //Log.info("* is in the beginning: stripping value of stars leaves only: " + trimmedStr);
            for (var section of this.datasets["courses"]) {
                if(keyRight === "instructor") {
                    //Log.info("It should be an instructor that we are looking for: " + trimmedStr);
                    var strings: string[] = section.getInstructors();
                    for(var s of strings){
                        //Log.info(strings[s]);
                        if (s.endsWith(trimmedStr)){
                          //  Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since instructor contains" + trimmedStr);
                            filteredResult.push(section);
                        }
                    }
                } else if (typeof section.getField(keyRight) === "string") {
                    var str: string = <string>section.getField(keyRight);
                    if (str.endsWith(trimmedStr)){
                        //Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
                        filteredResult.push(section);
                    }
                }
            }
        }
        // case3: value = adhe*
        else if (value.lastIndexOf("*") === value.length - 1){
            var trimmedStr: string = value.split("*")[0];
            //Log.info("* is at the end: stripping value of stars leaves only: " + trimmedStr);
            for (var section of this.datasets["courses"]) {
                if(keyRight === "instructor") {
                    //Log.info("It should be an instructor that we are looking for: " + trimmedStr);
                    var strings: string[] = section.getInstructors();
                    for(var s of strings){
                        //Log.info(strings[s]);
                        if (s.startsWith(trimmedStr)){
                          //  Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since instructor contains" + trimmedStr);
                            filteredResult.push(section);
                        }
                    }
                } else if (typeof section.getField(keyRight) === "string") {
                    var str: string = <string>section.getField(keyRight);
                    //Log.info("str has: " + str);
                    if (str.startsWith(trimmedStr)){
                        //Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
                        filteredResult.push(section);
                    }
                }
            }
        } else {
            // case4: value = adhe
           // Log.info("it is case2: value is: " + value);
            if (!(value.includes("*"))) {
                for (var section of this.datasets["courses"]) {
                    if(keyRight === "instructor") {
                        //Log.info("It should be an instructor that we are looking for: " + value);
                        var strings: string[] = section.getInstructors();
                        for(var s of strings){
                            //Log.info(strings[s]);
                            if (s === value){
                                // Log.info("handleIS() pushed " +  section.getField("dept") + section.getField("id") + " since instructor contains" + trimmedStr);
                                filteredResult.push(section);
                            }
                        }
                    } else if (section.getField(keyRight) === value) {
                       // Log.info("handleIS() pushed " + section.getField("dept") + section.getField("id") + " since it has a field containing" + trimmedStr);
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

    //From stack overflow
    //http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
    private dynamicSort(property: string) {
        Log.info("dynamicSort(): sorting...")
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a: any,b: any) {
            var result = (a[property] < b[property]) ? -1: (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    private dynamicSortNumber(property: string) {
        return function (a: any,b: any) {
            return a[property] - b[property];
        }

    }

    public query(query: QueryRequest): QueryResponse {
        for (var i = 0; i < this.tempResults.length; i++) {
            this.tempResults[i] = [];
        }
        this.tempResults = [];
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
                (<any>obj)[key] = course.getField(keyRight);
                //Log.info("Check it out!: " + obj[key]);
            }
            finalTable.push(obj);
        }

        if (query.ORDER) { //if is important because optional
            if (typeof(query.ORDER) === "string") {
                finalTable.sort(this.dynamicSort(query.ORDER));

            } else {
                finalTable.sort(this.dynamicSortNumber(query.ORDER));

            }
        }

        Log.info("FINISHED QUERY SUCCESFULLY! :D");

        //var resp: QueryResponse = {render: query.AS, result: finalTable};

        return {render: query.AS, result: finalTable};
    }
}
