/**
 * Created by rtholmes on 2016-09-03.
 */
"use strict"; //nice find :) -S

import Log from "../Util";
import JSZip = require('jszip');
import {xtends} from "tslint/lib/configs/latest";
import Course from "../model/Course";
import {error} from "util";
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
        fs.readFile("./data/"+id+".json", "utf8", function (err: Error, file) {
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
            for (var fileName: string of files) {
                fs.readFile("./data/" + fileName, "utf8", function (err: Error, file) {
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


    public readFile(fileName): any {
        fs.readFile("./data/" + fileName, "utf8", function (err: Error, file) {
            if (err) {
                Log.error("readFile() called by process() couldn't read file, probably wrong file name " + err)
            }
            var root = JSON.parse(file);
            var result = root.result;
            for (var i = 0; i < result.length; i++) {

                //check for missing fields
                if (!dept in result && !id in result) {
                    Log.error("readFile(): can't proceed missing fields");
                }

                var dept: string = result.Subject;
                var id: string = result.Course;
                var avg: number = result.Avg;
                var instructor: string = result.Professor; //lower case lastname, firstname
                var title: string = result.Title;
                var pass: number = result.Pass;
                var fail: number = result.Fail;
                var audit: number = result.Audit;
                var uniqueId: number = result.id;

                var newCourse: Course = new Course(dept, id);
                newCourse.title = title;

                var newSection: Section = new Section(uniqueId);
                newSection.average = avg;
                newSection.instructor = instructor;
                newSection.pass = pass;
                newSection.fail = fail;
                newSection.audit = audit;

                newCourse.addSection(newSection);

                this.processedData[dept + id] = newCourse;
            }
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
                    var promises:string[] = [];
                    for (var file of zip.files) {
                        Log.info("process(): reading file");
                        if (id == "courses") {
                            promises.push(that.readFile(file));
                        } else {
                            Log.error("process(): id is not courses");
                        }
                        Log.info("process(): file read succesfully");
                    }
                    Log.info("process(): all files read succesfully!!!");
                    return Promise.all(promises);


                    that.save(id, that.processedData);

                    fulfill(true);
                }).catch(function (err) {
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
    private save(id: string, processedDataset: any) {
        // add it to the memory model
        this.datasets[id] = processedDataset;

        // actually write to disk in the ./data directory
        fs.writeFile("./data/"+id+".json", processedDataset, function (err: Error) {
            if (err) {
                Log.error("save(): Error saving file after process " + err);
            }
            Log.info("save(): " + id + ".json was saved succesfully!");
        });
    }
}
