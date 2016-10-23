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

    private dataset: Course[] = [];
    private queryKeys: string[] = [];
    private wrongDatasetIDs: string[] = [];
    private GROUPkeys: string[] = [];
    private completeGROUPkeys: string[] = [];
    private APPLYkeys: string[] = [];

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
            Log.info("WHEREhelperObject:: empty WhHERE object");
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
        }
        if (!(orderString.includes("_"))){
            return 400;
        }
        // it used to be: (this.queryKeys.indexOf(orderString.split("_")[1], 0) == -1)
        if (!(orderString.split("_")[0] in this.datasets)){
            this.wrongDatasetIDs[0] = orderString.split("_")[0];
            //Log.info("QueryController :: isValidOrderHandler(..) - ORDER id is: not in datasets: " + orderString.split("_")[0]);
            return 424;
        }
        if (this.queryKeys.indexOf(orderString.split("_")[1]) === -1) {
            //Log.info("QueryController :: isValidOrderHandler(..) - " + orderString + " key is not included in GET keys");
            return 400;
        }
        //Log.info("QueryController :: isValidOrderHandler(..) - there is ORDER key included in GET keys ");
        return 200;
    }

    private isValidOrderObject(obj: OrderObject): number{
        if (Object.keys(obj).length !== 2) {
            return 400;
        }
        if ("dir" in obj && obj.dir.length !== 0){
            if (obj.dir === "UP" || obj.dir == "DOWN"){
                if ("keys" in obj && obj.keys.length !== 0){
                    var orderKeysArray : string[] = obj.keys;
                    var GROUPandAPPLYkeys: string[] = this.completeGROUPkeys.concat(this.APPLYkeys);
                    for(var o of orderKeysArray){
                        Log.info("isValidOrderObject:: this is the key being tried: " + o);
                        if (GROUPandAPPLYkeys.indexOf(o) === -1){
                            Log.info("isValidOrderObject :: ORDER key is not in GROUPorAPPLY keys");
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

    private d1isValidGetHandler(getArray : string[]): number{
        if (getArray.length <= 0) {
            return 400;
        } else {
            for (var i of getArray) {
                if (!(i.includes("_"))) {
                    if (this.APPLYkeys.indexOf(i) === -1) {
                        return 400;
                    }
                } else {
                    var GETelement: string[] = i.split("_");
                    var id: string = GETelement[0];
                    //Log.info("QueryController :: isValidGetHandler(..) - id is: " + id);
                    if (!(id in this.datasets)) {
                        this.wrongDatasetIDs.push(id);
                        return (424);
                    } else {
                        var datasetField = GETelement[1];
                        if (!(this.validKeys(datasetField))) {
                            //Log.info("QueryController :: isValidGetHandler - wrong field in query submitted ");
                            return 400;
                        } else {
                            //Log.info("QueryController :: isValidGetHandler - pushing datasetField: " + datasetField);
                            this.queryKeys.push(datasetField);
                        }
                    }
                }
            }
            return 200;
        }
    }

    private isValidGetHandler(getArray:string[]): number{
        Log.info("isValidGetHandler:: STARTED");
        if (getArray.length === 0) {
            Log.info("isValidGetHandler:: input has size 0");
            return 400;
        } else {
            for (var i of getArray) {
                if (!(i.includes("_"))){
                    Log.info("isValidGetHandler:: GET key: " + i + " doesn't include _");
                    if (this.APPLYkeys.indexOf(i) === -1){
                        Log.info("isValidGetHandler:: GET key not found in APPLYkeys");
                        return 400;
                    }
                } else {
                    var GETelement: string[] = i.split("_");
                    var id: string = GETelement[0];
                    //Log.info("QueryController :: isValidGetHandler(..) - id is: " + id);
                    if (!(id in this.datasets)) {
                        this.wrongDatasetIDs.push(id);
                        //Log.info("QueryController :: isValidGetHandler(..) - 424 error: " + id + " hasn't been put");
                        //Log.info("QueryController :: isValidGetHandler(..) - the wrongDatasetIDS are " + JSON.stringify(this.wrongDatasetIDs));
                        return (424);
                    }
                    //Log.info("QueryController :: isValidGetHandler(..) - id is already in datasets");
                    var datasetField = GETelement[1];
                    //Log.info("QueryController :: isValidGetHandler(..) - datasetField is: " + datasetField);
                    /*if (!(this.validKeys(datasetField))){
                     //Log.info("QueryController :: isValidGetHandler - wrong field in query submitted ");
                     return 400;
                     } else {
                     //Log.info("QueryController :: isValidGetHandler - pushing datasetField: " + datasetField);
                     this.queryKeys.push(datasetField);
                     }
                     */
                    if (this.GROUPkeys.indexOf(datasetField) === -1) {
                        return 400;
                    }
                }
            }
            return 200;
        }
    }

    private APPLYandGROUPhandler(query: QueryRequest) : number {
        if ("APPLY" in query && "GROUP" in query){
            if (query.GROUP.length === 0){
                return 400;
            }
            var groupArray: string[] = query.GROUP;
            for (var i of groupArray){
                if (!(i.includes("_"))){
                    return 400;
                }
                var GROUPelement: string[] = i.split("_");
                var id = GROUPelement[0];
                Log.info("APPLYandGROUPhandler:: This is id: " + id);
                if (!(id in this.datasets)) {
                    this.wrongDatasetIDs.push(id);
                    Log.info("About to return 424, group element id not in dataset");
                    return (424);

                } else {
                    var groupKey = GROUPelement[1];
                    if (!(this.validKeys(groupKey))) {
                        return 400;
                    } else {
                        Log.info("String I want being pushed to GROUP keys: " + i);
                        this.completeGROUPkeys.push(i);
                        this.GROUPkeys.push(groupKey);
                    }
                }
            }

            var applyStruct:{}[] = query.APPLY;
            for (var j of applyStruct){
                var wantedComputation: {} = j;
                var stringName: string = Object.keys(wantedComputation)[0];
                Log.info("String being pushed to APPLYkeys: " + stringName);
                this.APPLYkeys.push(stringName);
                var APPLYkeyObject: {} = (<any>wantedComputation)[stringName];
                var key : string = Object.keys(APPLYkeyObject)[0];
                if (!(key === "AVG" || key === "COUNT" || key === "MAX" || key === "MIN")){
                    return 400;
                }
                var field: string = (<any>APPLYkeyObject)[key];
                if (key === "MAX" || key === "MIN" || key === "MAX"){
                    if (!(field === "avg" || field === "pass" || field === "fail" ||field === "audit")){
                        return 400;
                    }
                }

                var idAndField: string = (<any>APPLYkeyObject)[key];
                var APPLYelement : string[] = idAndField.split("_");
                var APPLYid : string = APPLYelement[0];
                Log.info("APPLYid is: " + APPLYid);
                if (!(APPLYid in this.datasets)){
                    Log.info("About to return 424, APPLY inner element id not in dataset");
                    return 424;
                } else {
                    var APPLYfield : string = APPLYelement[1];
                    if (!(this.validKeys(APPLYfield))){
                        return 400;
                    }
                }
            }
            return 200;
        }
    }

    public d1IsValid(query: QueryRequest): number {
        if (typeof query !== 'undefined' && query !== null ) {
            if ("GET" in query && "WHERE" in query && "AS" in query) {
                // GET part of query
                var GETelements: string[] = query.GET;
                // Log.info("QueryController :: isValid(..) - GETelements are: " + JSON.stringify(GETelements) + "going into isValidGetHandler");
                var GETresult = this.d1isValidGetHandler(GETelements);
                if (GETresult === 200) {
                    var ASresult = this.isValidAsHandler(query.AS);
                    if (ASresult === 200) {
                        // ORDER is optional
                        if (query.ORDER === "") {
                            return 400;
                        }
                        if (query.ORDER) {
                            var ORDERresult: number;
                            if (typeof query.ORDER === "string") {
                                var ORDERstring: string = <any>(query.ORDER);
                                ORDERresult = this.isValidOrderHandler(ORDERstring);
                                //Log.info("isValid(..) - returned from isValidOrderHandler, ORDERresult: " + ORDERresult);
                            }
                            if (ORDERresult === 200) {
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
        }
        return 400;
    }

    public isValid(query: QueryRequest): number {
        Log.info("isValid:: STARTED");
        if (typeof query !== 'undefined' && query !== null ){
            Log.info("isValid:: query not undefined or null");

            if (!("GROUP" in query || "APPLY" in query)){
                Log.info("Query is type d1")
                return this.d1IsValid(query);
            }

            else if ("GROUP" in query && "APPLY" in query) {
                Log.info("isValid:: query is D2 type");
                var APPLYandORDERresult = this.APPLYandGROUPhandler(query);
                if (APPLYandORDERresult !== 200) {
                    Log.info("APPLYandORDERresult: " + APPLYandORDERresult)
                    return APPLYandORDERresult;
                } else{
                    if ("GET" in query && "WHERE" in query && "AS" in query) {
                        Log.info("isValid:: query has WHERE, AS, and GET");
                        // GET part of query
                        var GETelements: string[] = query.GET;
                        // Log.info("QueryController :: isValid(..) - GETelements are: " + JSON.stringify(GETelements) + "going into isValidGetHandler");
                        var GETresult: number = this.isValidGetHandler(GETelements);
                        Log.info("isValid:: this is GETresult: " + GETresult);
                        if (GETresult === 200) {
                            Log.info("isValid:: going now to AS handler");
                            var ASresult = this.isValidAsHandler(query.AS);
                            if (ASresult === 200) {
                                Log.info("isValid:: AS returned 200, going to WHERE helper");
                                var WHEREresult = this.WHEREhelperObject(query.WHERE);
                                if (WHEREresult === 200) {
                                    if (query.ORDER === "") {
                                        return 400;
                                    }
                                    if ("ORDER" in query) {
                                        Log.info("isValid:: query has optional key ORDER");
                                        //Log.info("it returned T for query.ORDER");
                                        var ORDERresult: number = 0;
                                        if (query.ORDER) {
                                            Log.info("isValid:: query not undefined or null");
                                            if (typeof query.ORDER === "string") {
                                                var ORDERstring: string = <any>(query.ORDER);
                                                Log.info("isValid:: ORDER is string");
                                                ORDERresult = this.isValidOrderHandler(ORDERstring);
                                                //Log.info("isValid(..) - returned from isValidOrderHandler, ORDERresult: " + ORDERresult);
                                            }
                                            else if (typeof query.ORDER === "object") {
                                                var ORDERobject: OrderObject = <any>(query.ORDER);
                                                Log.info("isValid:: ORDER is an object");
                                                ORDERresult = this.isValidOrderObject(ORDERobject);
                                            }
                                        }
                                        return ORDERresult;
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
        //initialize temp arrays
        this.tempResults = [];
        this.tempResults[0] = [];

        Log.trace('QueryController::query( ' + JSON.stringify(query) + ' )');

        this.nextObjectOrArray (query.WHERE);

        var finalTable: {}[] = [];
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
/*
        if (query.ORDER) { //if is important because optional
            if (typeof(query.ORDER) === "string") {
                finalTable.sort(this.dynamicSort(query.ORDER));

            } else {
                finalTable.sort(this.dynamicSortNumber(query.ORDER));

            }
        }
        */

        Log.info("FINISHED QUERY SUCCESFULLY! :D");

        return {render: query.AS, result: finalTable};
    }
}
