/**
 * Created by rtholmes on 2016-06-19.
 */

import {Datasets} from "./DatasetController";
import Log from "../Util";
import Course from "../model/Course";

export interface QueryRequest {
    GET: string[]; //has to be string array -S
    WHERE: {};
    ORDER?: {}|string;      // how it should be for D2, won't compile for now
    //ORDER?: string; //order is optional -S
    GROUP?: string[];
    APPLY?:{}[];
    AS: string;
}

export interface QueryResponse {
    render: string;
    result: {}[];
}

export interface OrderObject {
    dir: string;
    keys: string[];
}

export default class QueryController {
    private datasets: Datasets = null;

    private tempResults: Course[][][] = [];
    private tempResultsIndex: number = 0;

    private groupedResults: Course[][] = [];

    private dataset: Course[] = [];
    private queryKeys: string[] = [];
    private wrongDatasetIDs: string[] = [];
    private GROUPandAPPLYkeys: string[] = [];

    constructor(datasets: Datasets) {
        this.datasets = datasets;
     //   this.datasetID = id;
     //   this.dataset = this.getDataset(id);
    }

    public returnWrongIDs(): string[]{
        return this.wrongDatasetIDs;
    }

    private weedOutErrorResults(results: number[]) : number {
        for (var i of results){
            if (i === 400) {
                return 400;
            }
            if(i === 424){
                return 424;
            }
        }
        return 200;
    }

    private WHEREhelperArray(array:{}[]): number {
        var resultNumbers :number[] = [];
        for(var i of array) {
            resultNumbers.push(this.WHEREhelperObject(i));
        }
        return this.weedOutErrorResults(resultNumbers)
    }

    private validKeys(s: string): boolean{
        if (s === "dept" || s === "id" || s === "avg" || s === "instructor" || s === "title" || s === "pass" || s === "fail" ||
            s === "audit" || s === "uuid"){
            return true;
        }
        return false;
    }

    private WHEREhelperObject(whereObject: {}): number {
        if (Object.keys(whereObject).length === 0){
            return 200;
        }
        if (Object.keys(whereObject).length > 1){
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
                if (this.validKeys(Object.keys(whereObject)[0].split("_")[1])){
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

    private isValidOrderHandler(orderString: string): number {
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


    private isValidOrderObject(obj: OrderObject): number{
        if (obj.dir){
            if (obj.dir === "UP" || obj.dir == "DOWN"){
                // check for obj.keys === "" needed?
                if (obj.keys){
                    var orderKeysArray = obj.keys;
                    for(var o of orderKeysArray){
                        if (this.queryKeys.indexOf(o) === -1){
                            return 400;
                        }
                    }
                    return 200;
                }
            }
        }
        return 400;
    }

    private isValidAsHandler(asString: string): number{
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

    private isValidGetHandler(getArray:string[]): number{
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
                    if (!(this.validKeys(datasetField))){
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


    private APPLYandGROUPhandler(query: QueryRequest) : number {
        if (query.APPLY && query.GROUP){

        }
        return 400;
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
                        var WHEREresult = this.WHEREhelperObject(query.WHERE);
                        if (WHEREresult === 200) {
                            Log.info("this is query.ORDER" + query.ORDER);
                           if (query.ORDER === ""){
                                return 400;
                            }
                           if (query.ORDER || query.APPLY || query.GROUP){
                               //Log.info("it returned T for query.ORDER");
                               var optionalKeysResults: number[] = [] ;
                               var ORDERresult: number;
                               var APPLYandORDERresult: number;
                               if (query.ORDER){
                                   if (typeof query.ORDER === "string"){
                                       var ORDERstring: string = <any>(query.ORDER);
                                       ORDERresult = this.isValidOrderHandler(ORDERstring);
                                       optionalKeysResults.push(ORDERresult);
                                       //Log.info("isValid(..) - returned from isValidOrderHandler, ORDERresult: " + ORDERresult);
                                   }
                                   else if (typeof query.ORDER === "object") {
                                       var ORDERobject:OrderObject = <any>(query.ORDER);
                                       ORDERresult = this.isValidOrderObject(ORDERobject);
                                       optionalKeysResults.push(ORDERresult);
                                   }
                               }
                               if(query.APPLY || query.GROUP){
                                   APPLYandORDERresult = this.APPLYandGROUPhandler(query);
                                   optionalKeysResults.push(APPLYandORDERresult);
                               }
                               return this.weedOutErrorResults(optionalKeysResults);
                           }
                        }
                        return WHEREresult;
                    } else {
                        return ASresult;
                    }
                } else {
                    return GETresult;
                }
            }
            //Log.info("QueryController :: isValid(..) - query doesn't include GET, WHERE, AS");
        }
        //Log.info("QueryController :: isValid(..) - query is either undefined, null" );
        return 400;
    }

    public getDataset(id: string): Course[]{
        this.dataset = this.datasets[id];
        return this.dataset;
    }

    private handleAND (arr: {}[]) {
        Log.info("START handleAND(" + JSON.stringify(arr) + ")");
        this.tempResults[++this.tempResultsIndex] = [];
        Log.info("Adding tempResuts array, now size = " + this.tempResults.length);
        // - should check if section id is present in all tempResults arrays
        // - collect the one's that are and set tempResults = [] and store the new result
        for (var obj of arr) {
            this.nextObjectOrArray(obj);
        }
        Log.info("... back to handleAND - tempResults size = " + this.tempResults[this.tempResultsIndex].length);
        var filteredResult: Course[] = [];
        for (var course of this.tempResults[this.tempResultsIndex][0]) {
            var id: number = course.uniqueId;
            var exists: boolean = false;
            for (var i = 1; i < this.tempResults[this.tempResultsIndex].length; i++) {
                exists = false;
                for (var checkCourse of this.tempResults[this.tempResultsIndex][i]) {
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
        //this.tempResults = [];
        this.tempResults[--this.tempResultsIndex].push(filteredResult);
        Log.info("END handleAND");
    }

    private handleOR (arr: {}[]) {
        Log.info("START handleOR(" + JSON.stringify(arr) + ")");
        this.tempResults[++this.tempResultsIndex] = [];
        Log.info("Adding tempResuts array, now size = " + this.tempResults.length);
        // - should combine all tempResults arrays into one array
        // - set tempResults = [] and store new result
        for (var obj of arr) {
            this.nextObjectOrArray(obj);
        }
        Log.info("... back to handleOR - tempResults size = " + this.tempResults[this.tempResultsIndex].length);
        var merged: Course[] = [].concat.apply([], this.tempResults[this.tempResultsIndex]);

        //SWEEP FOR DUPLICATES
        //Found on stackoverflow
        var poop = {};
        for (var i = 0; i < merged.length; i++) {
            (<any>poop)[merged[i]["_uuid"]] = merged[i];
        }
        merged = [];
        for (var key in poop) {
            merged.push((<any>poop)[key]);
        }

        //this.tempResults = [];
        this.tempResults[--this.tempResultsIndex].push(merged);
        Log.info("STORED IN: " + this.tempResultsIndex + ", hopefully this is 0");
        Log.info("END handleOR");
    }


    private handleNOT (obj: {}) {
        Log.info("START handleNOT(" + JSON.stringify(obj) + ")");
        this.tempResults[++this.tempResultsIndex] = [];
        Log.info("Adding tempResuts array, now size = " + this.tempResults.length);
        this.nextObjectOrArray(obj);
        Log.info("... back to handleNOT - tempResults size = " + this.tempResults[this.tempResultsIndex].length);

        var tempMaster: Course[] = this.datasets["courses"];
        var filteredResult: Course[] = [];
        for (var c1 of tempMaster) {
            var exists: boolean = false;
            for (var c2 of this.tempResults[this.tempResultsIndex][0]) {
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
        //this.tempResults = [];
        this.tempResults[--this.tempResultsIndex].push(filteredResult);
        Log.info("END handleNOT");
    }

    private handleLT (obj: {}) {
        Log.info("START handleLT(" + JSON.stringify(obj) + ")");
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
        this.tempResults[this.tempResultsIndex].push(filteredResult);
        Log.info("END handleLT");
    }

    private handleGT (obj: {}) {
        Log.info("START handleGT(" + JSON.stringify(obj) + ")");
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
        this.tempResults[this.tempResultsIndex].push(filteredResult);
        Log.info("END handleGT");
    }

    private handleEQ (obj: {}) {
        Log.info("START handleEQ(" + JSON.stringify(obj) + ")");
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
        this.tempResults[this.tempResultsIndex].push(filteredResult);
        Log.info("END handleEQ");
    }

    private handleIS (obj: {}) {
        Log.info("START handleIS(" + JSON.stringify(obj) + ")");
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
                       // Log.info(s);
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
                       // Log.info(s);
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
                       // Log.info(s);
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
                          //  Log.info(s);
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
        this.tempResults[this.tempResultsIndex].push(filteredResult);
        Log.info("END handleIS");
    }


    private nextObjectOrArray (checkObj: any) {
        Log.info("NEXT(" + JSON.stringify(checkObj) + ")");

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
            Log.info("Empty where detected");
            this.tempResults[0][0] = this.datasets["courses"];
        }
    }

    private handleMAX (key: string, groupIndex: number): number {
        var max: number = <number>this.groupedResults[groupIndex][0].getField(key);
        for (var course of this.groupedResults[groupIndex]) {
            if (course.getField(key) > max) {
                max = <number>course.getField(key);
            }
        }
        // return Math.round(max * 100) / 100;
        return Number(max.toFixed(2));
    }

    private handleMIN (key: string, groupIndex: number): number {
        var min: number = <number>this.groupedResults[groupIndex][0].getField(key);
        for (var course of this.groupedResults[groupIndex]) {
            if (course.getField(key) < min) {
                min = <number>course.getField(key);
            }
        }
        return Math.round(min * 100) / 100;
    }

    private handleAVG (key: string, groupIndex: number): number {
        key = key.split("_")[1];
        var sum = 0;
        var i = 0;
        for (i; i < this.groupedResults[groupIndex].length; i++) {
            var course: Course = this.groupedResults[groupIndex][i];
            var add: number = <number>course.getField(key);
            sum += add;
        }
        return Math.round((sum / i) * 100) / 100;
    }

    private handleCOUNT (key: string, groupIndex: number): number {
        return this.groupedResults[groupIndex].length;
    }

    private handleApply (applyArray: {}[], applyToken: string, groupIndex: number): {} {
        for (var o of applyArray) {
            var obj: any = <any>o;
            if (obj[applyToken]) {
                var applyFunctionName: string = Object.keys(obj[applyToken])[0];
                if (applyFunctionName === "MAX") {
                    return this.handleMAX(obj[applyToken]["MAX"], groupIndex);
                } else if (applyFunctionName === "MIN") {
                    return this.handleMIN(obj[applyToken]["MIN"], groupIndex);
                } else if (applyFunctionName === "AVG") {
                    return this.handleAVG(obj[applyToken]["AVG"], groupIndex);
                } else if (applyFunctionName === "COUNT") {
                    return this.handleCOUNT(obj[applyToken]["COUNT"], groupIndex);
                } else {
                    //
                }
            }
        }
    }

    //From stack overflow
    //http://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
    private dynamicSort(property: string) {
        Log.info("dynamicSort(): sorting...");
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

    private dynamicSortTwo(field: string, reverse: any){

        var key = function(x: any) {return x[field]};

        reverse = !reverse ? 1 : -1;

        return function (a: any, b: any) {
            return a = key(a), b = key(b), reverse * (<any>(a > b) - <any>(b > a));
        }
    }

    public query(query: QueryRequest): QueryResponse {
        //initialize temp arrays
        this.tempResults = [];
        this.tempResults[0] = [];
        this.groupedResults = [];

        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        this.nextObjectOrArray (query.WHERE);

        var finalTable: {}[] = [];
        if (query.GROUP && query.APPLY) {
            // can be replace by Ana Cris' global variables: this.GROUPkeys and this.APPLYkeys
            var groupTerms: string[] = [];
            var applyTerms: string[] = [];
            for (var term of query.GET) {
                if ((<string>term).includes("_")) {
                    groupTerms.push(term);
                } else {
                    applyTerms.push(term);
                }
            }
            //Make groups
            var termPairingsAlreadyFound: {[pair: string]: number} = {}; //leads term pairings to index of group course[] (for better time complexity) -S
            var termPairingsAlreadyFoundIndex: number = 0;
            for (var course of this.tempResults[0][0]) {
                var allSame: boolean = true;
                var buildTermPairing: string = "";
                for (var term of groupTerms) {
                    var keyRight:string = term.split("_")[1];
                    var fieldValue = course.getField(keyRight);
                    if (typeof (fieldValue) === "number") {
                        buildTermPairing += (<number>fieldValue).toString();
                    } else if (typeof (fieldValue) === "string") {
                        buildTermPairing += (<string>fieldValue);
                    } else {
                        //typeof String[]
                        buildTermPairing += JSON.stringify(<string[]>fieldValue);
                    }
                }
                if (buildTermPairing in termPairingsAlreadyFound) {
                    this.groupedResults[termPairingsAlreadyFound[buildTermPairing]].push(course);
                } else {
                    termPairingsAlreadyFound[buildTermPairing] = termPairingsAlreadyFoundIndex;
                    this.groupedResults[termPairingsAlreadyFound[buildTermPairing]] = [];
                    termPairingsAlreadyFoundIndex++;
                    this.groupedResults[termPairingsAlreadyFound[buildTermPairing]].push(course);
                }
            }

            //start building new table
            //query.GET is already string[]
            //invariant: all courses in groups will have the same value for Group keys
            for (var i = 0; i < this.groupedResults.length; i++) {
                var row: {} = {};
                for (var term of query.GET) {
                    if (term.includes("_")) {
                        var groupValue = this.groupedResults[i][0].getField(term.split("_")[1]);
                        (<any>row)[term] = groupValue;
                    } else {
                        (<any>row)[term] = this.handleApply(query.APPLY, term, i);
                    }
                }
                finalTable.push(row);
            }
        } else {
            var wantedKeys: string[] = [];
            for (var getVariables of query.GET) {
                var wantKey: string = getVariables;
                wantedKeys.push(wantKey);
            }
            for (var course of this.tempResults[0][0]) {
                var obj: {} = {};
                for (var key of wantedKeys) {
                    var keyRight: string = key.split("_")[1];
                    (<any>obj)[key] = course.getField(keyRight);
                    //Log.info("Check it out!: " + obj[key]);
                }
                finalTable.push(obj);
            }
        }

        if (query.ORDER) { //if is important because optional
            if (typeof(query.ORDER) === "string") {
                //d1
                // var sort = (<string>query.ORDER).split("_")[1];
                // if (sort === "dept" || sort === "id" || sort === "title") {
                //     finalTable.sort(this.dynamicSort(<string>query.ORDER));
                // } else if (sort === "instructor") {
                //     finalTable.sort(this.dynamicSort(<string>query.ORDER));
                //     //should use JSON.stringify to accomodate sorting array in future
                // } else {
                //     finalTable.sort(this.dynamicSortNumber(<string>query.ORDER));
                // }
                finalTable.sort(this.dynamicSortTwo(<string>query.ORDER, false));

            } else {
                var orderObj = <OrderObject>query.ORDER;
                var direction: boolean = false;
                if (orderObj.dir === "DOWN") {
                    direction = true;
                }
                for (var i = orderObj.keys.length - 1 ; i > -1; i--) {
                    finalTable.sort(this.dynamicSortTwo(orderObj.keys[i], direction));
                }
            }
        }


        Log.info("FINISHED QUERY SUCCESFULLY! :D");

        return {render: query.AS, result: finalTable};
    }
}
