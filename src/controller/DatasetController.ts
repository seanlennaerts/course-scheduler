/**
 * Created by rtholmes on 2016-09-03.
 */
"use strict"; //nice find :) -S

import Log from "../Util";
import JSZip = require('jszip');
import Course from "../model/Course";
import Section from "../model/Section";
var fs = require('fs');   //var is good -S                    //to use file system in node.js



// PUT
/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

export default class DatasetController {

    private processedData: Datasets = {}; //trying to keep everything in one object mapped key:course
    private datasets: Datasets = {};

    constructor() {
        Log.trace('DatasetController::init()');
    }
    /**
     * Returns the referenced dataset. If the dataset is not in memory, it should be
     * loaded from disk and put in memory. If it is not in disk, then it should return
     * null.
     *
     * @param id
     * @returns {{}}
     */
    public getDataset(id: string): any {
        // this should check if the dataset is on disk in ./data if it is not already in memory.

        // if the "id in this.datasets" doesn't work try a try/catch block -S
        if (id in this.datasets) {
            return this.datasets[id];
        }
        fs.readFile("./data/"+id+".json", "utf8", function (err: Error, file: string) {
            if (err) {
                Log.error("getDataset(): reading file from disk " + err);
                return null;
            }
            return JSON.parse(file);
        });
    }

    public getDatasets(): Datasets {
        // if datasets is empty, load all dataset files in ./data from disk
        fs.readdir("./data", function(err: Error, files: string[]) {
            if (err) {
                Log.error("getDatasets(): trouble reading files in directory " + err);
            }
            for (var fileName of files) {
                fs.readFile("./data/" + fileName, "utf8", function (err: Error, file: string) {
                    if (err) {
                        Log.error("getDatasets(): trying to read file, probably something wrong with file name " + err);
                    }
                    var split: string[] = fileName.split(".");
                    this.datasets[split[0]] = JSON.parse(file);
                })
            }
        });
        return this.datasets;
    }


    public readFile(zip: JSZip, path: string): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            zip.file(path).async("string").then(function (contents: string) {
                //Log.info(contents);
                var root = JSON.parse(contents);
                for (var i = 0; i < root.result.length; i++) {

                    //check for missing fields
                    // if (!dept in result && !id in result) {
                    //     Log.error("readFile(): can't proceed missing fields");
                    // }

                    var dept: string = root.result[i].Subject;
                    Log.info("dept: " + dept);
                    var id: string = root.result[i].Course;
                    Log.info("id: " + id);
                    var avg: number = root.result[i].Avg;
                    Log.info("avg: " + avg);
                    var instructor: string = root.result[i].Professor; //lower case lastname, firstname
                    Log.info("instructor: " + instructor);
                    var title: string = root.result[i].Title;
                    Log.info("title: " + title);
                    var pass: number = root.result[i].Pass;
                    Log.info("pass: " + pass);
                    var fail: number = root.result[i].Fail;
                    Log.info("fail: " + fail);
                    var audit: number = root.result[i].Audit;
                    Log.info("audit: " + audit);
                    var uniqueId: number = root.result[i].id;
                    Log.info("uniqueId: " + uniqueId);

                    var newCourse: Course = new Course(dept, id);
                    newCourse.title = title;

                    var newSection: Section = new Section(uniqueId);
                    newSection.average = avg;
                    newSection.instructor = instructor;
                    newSection.pass = pass;
                    newSection.fail = fail;
                    newSection.audit = audit;

                    newCourse.addSection(newSection);

                    that.processedData[dept + id] = newCourse;
                } //end for loop
            }).then(function() {
                fulfill(true);
            }).catch(function (reason: any) {
                Log.error("readFile(): ERROR " + reason);
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
    public process(id: string, data: any): Promise<boolean> {
        Log.trace('DatasetController::process( ' + id + '... )');

        let that = this;
        return new Promise(function (fulfill, reject) {
            Log.info("process(): start");
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    //let processedDataset = {};
                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.
                    var promises: string[] = [];

                    // for (var i = 0; i < Object.keys(zip.files).length; i++) {
                    //     Log.info("process(): reading file");
                    //     Log.info("zip length is: " + Object.keys(zip.files).length);
                    //     switch (id) { //handle different dataset types
                    //         case "courses": //so far only need to handle id "courses"
                    //             Log.info("process(): id is courses, calling readFile() on: ");
                    //             promises.push(<any>that.readFile(zip.files[i]));
                    //             break;
                    //         default:
                    //             Log.error("process(): id is not courses");
                    //     }
                    //     Log.info("process(): file read succesfully");
                    // }

                    zip.folder(id).forEach(function (relativePath, file) {
                        //Log.info("file full path: " + file.name + ", relativePath: " + relativePath);
                        //Log.info("process(): is calling readFile() on: " + file.name);
                        promises.push(<any>that.readFile(zip, file.name));
                    });
                    Log.info("process(): all readFile promises are ready!");
                    return Promise.all(promises);

                }).then(function(result: string[]) {
                    that.save(id, that.processedData);
                    fulfill(true);
                }).catch(function (err: Error) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(err);
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
    private save(id: string, processedData: Datasets) {
        // add it to the memory model
        this.datasets[id] = processedData;

        // actually write to disk in the ./data directory

        //check if directory data exits
        //bad practice, better handle the error instead and not use sync either -S
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
        }

        var toWrite: string = JSON.stringify(processedData);
        fs.writeFile("./data/"+id+".json", toWrite, function (err: Error) {
            if (err) {
                Log.error("save(): Error saving file after process " + err);
            }
            Log.info("save(): " + id + ".json was saved succesfully!");
        });
    }
}
