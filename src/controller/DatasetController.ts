/**
 * Created by rtholmes on 2016-09-03.
 */
"use strict"; //nice find :) -S

import Log from "../Util";
import JSZip = require('jszip');
import Course from "../model/Course";
var fs = require('fs');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: Course[];
}

export default class DatasetController {

    private processedData: Course[] = [];
    private datasets: Datasets = {};

    constructor() {
        Log.trace('DatasetController::init()');
    }

    public getDatasets(): Datasets {
        if ("courses" in this.datasets) {
            Log.info("getDatasets(): already exists so returning existing datasets");
            return this.datasets;
        }
        try {
            var file: string = fs.readFileSync("./data/courses.json", "utf8");
            //this.datasets["courses"] = JSON.parse(file);
            this.datasets["courses"] = [];
            this.parseAgain(JSON.parse(file));
            Log.info("getDatasets(): not in memory so reading from data directory");
            this.datasets["courses"] = this.processedData;
            return this.datasets;
        } catch (err) {
            //
            return this.datasets;
        }
    }

    private parseAgain(json: any) {
        for (var i = 0; i < json.length; i++) {
            var dept: string = json[i]._dept;
            var id: string = json[i]._id;
            var avg: number = json[i]._avg;
            var instructor: string[] = json[i]._instructor;
            var title: string = json[i]._title;
            var pass: number = json[i]._pass;
            var fail: number = json[i]._fail;
            var audit: number = json[i]._audit;
            var uniqueId: number = json[i]._setionId;

            var newCourse: Course = new Course(uniqueId, dept, id, title, avg,
                instructor, pass, fail, audit);

            this.processedData.push(newCourse);
        }
    }

    public deleteDataset(id: string): number{
        if (id in this.datasets) {
            delete this.datasets[id];
            fs.unlinkSync("./data/" + id + ".json");
            Log.info("deleteDataset(): deleted " + id + " succesfully!");
            return 204;
        } else {
            return 404;
        }
    }

    public readFile(zip: JSZip, path: string): Promise<any> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            zip.file(path).async("string").then(function (contents: string) {
                //Log.info(contents);
                var root = JSON.parse(contents);
                //Log.info("readFile(): there are " + root.result.length + " sections in " + path);
                // if (root.result.length == 0) {
                //     Log.info("readFile(): " + path + " has no sections!")
                //     countMissingSections++;
                // }
                if (!root.result) {
                    Log.info("readFile(): not valid zip");
                    //throw new Error("readFile(): not valid zip");
                    reject(new Error("Invalid archive"));
                }

                for (var i = 0; i < root.result.length; i++) {

                    //check for missing fields

                    var dept: string = root.result[i].Subject;
                    // Log.info("dept: " + dept);
                    var id: string = root.result[i].Course;
                    // Log.info("id: " + id);
                    var avg: number = root.result[i].Avg;
                    // Log.info("avg: " + avg);
                    var instructor: string = root.result[i].Professor; //lower case lastname, firstname
                    var instructorArray: string[] = instructor.split(";");
                    // if (instructorArray.length > 1) {
                    //     Log.info("instructorArray: " + instructorArray.toString());
                    // }
                    // Log.info("instructor: " + instructor);
                    var title: string = root.result[i].Title;
                    // Log.info("title: " + title);
                    var pass: number = root.result[i].Pass;
                    // Log.info("pass: " + pass);
                    var fail: number = root.result[i].Fail;
                    // Log.info("fail: " + fail);
                    var audit: number = root.result[i].Audit;
                    // Log.info("audit: " + audit);
                    var uuid: number = root.result[i].id;
                    // Log.info("uniqueId: " + uniqueId);

                    var newSection = new Course (uuid, dept, id, title, avg, instructorArray, pass, fail, audit);
                    that.processedData.push(newSection);
                } //end for loop
            }).then(function() {
                fulfill(true);
            }).catch(function (err: Error) {
                reject(err);
            });
        });
    }


    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<number> {
        Log.trace('DatasetController::process( ' + id + '... )');

        var code: number = 0;
        if (id in this.datasets) {
            code = 201;
        } else {
            code = 204
        }

        let that = this;
        return new Promise(function (fulfill, reject) {
            Log.info("process(): start");
            try {
                if (id != "courses") {
                    throw new Error("Invalid id");
                }
                //another hacky fix that should be refactored
                var invalidDataset: boolean = false;

                //

                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    // iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.
                    var promises: string[] = [];
                    zip.folder(id).forEach(function (relativePath, file) { // find name of the zipfile and replace "courses"
                        //Log.info("relativePath: " + relativePath + ", file: " + file);
                        promises.push(<any>that.readFile(zip, file.name));
                    });
                    Log.info("process(): all readFile promises are ready!");
                    Log.info("process(): there are " + promises.length + " valid files");
                    if (promises.length === 0) {
                        // throw new Error("process(): Not valid dataset");
                        //reject(new Error("Invalid dataset"));
                        invalidDataset = true;
                    }
                    return Promise.all(promises);

                }).then(function() {
                    if (invalidDataset) {
                        reject(new Error("Invalid dataset"));
                    } else {
                        that.save(id);
                        fulfill(code);
                    }
                }).catch(function (err: Error) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(new Error("Invalid archive"));
                });
            } catch (err) {
                Log.trace('DatasetController::process(..) - ERROR: ' + err);
                reject(err);
            }
        });
    }

    /**
     * Writes the processed dataset to disk as 'id.json'. The function should overwrite
     * any existing dataset with the same name.
     *
     * @param id
     * @param processedDataset
     */
    private save(id: string) {
        // add it to the memory model
        this.datasets[id] = this.processedData;

        // actually write to disk in the ./data directory
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
        }

        var toWrite: string = JSON.stringify(this.processedData);
        fs.writeFile("./data/"+id+".json", toWrite, function (err: Error) {
            if (err) {
                Log.error("save(): Error saving file after process " + err);
                throw err;
            }
            Log.info("save(): " + id + ".json was saved succesfully!");
        });

        this.processedData = [];
    }
}
