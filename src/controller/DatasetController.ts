/**
 * Created by rtholmes on 2016-09-03.
 */
"use strict"; //nice find :) -S

import Log from "../Util";
import JSZip = require('jszip');
import Course from "../model/Course";
var fs = require('fs');   //var is good -S                    //to use file system in node.js

//temp -S
//var countMissingSections = 0;


// PUT
/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: Course[];
}

export default class DatasetController {

    private processedData: Course[] = []; //-S

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
    // public getDataset(id: string): any {
    //     // this should check if the dataset is on disk in ./data if it is not already in memory.
    //
    //     // if the "id in this.datasets" doesn't work try a try/catch block -S
    //     if (id in this.datasets) {
    //         return this.datasets[id];
    //     }
    //     fs.readFile("./data/" + id + ".json", "utf8", function (err: Error, file: string) {
    //         if (err) {
    //             Log.error("getDataset(): reading file from disk " + err);
    //             return null;
    //         }
    //         return JSON.parse(file);
    //     });
    // }

    public getDatasets(): Datasets {
        // check first if memory has stored datasets
        // if (Object.keys(this.datasets).length > 0) {
        //     return this.datasets;
        // }
        // if ("courses" in this.datasets) {
        //     Log.info("returning in if");
        //     return this.datasets;
        // }
        // fs.readFile("./data/courses.json", "utf8", function (err: Error, file: string) {
        //     if (err) {
        //         Log.error("getDatasets(): trying to read file, probably something wrong with file name " + err);
        //     }
        //     this.datasets["courses"] = JSON.parse(file);
        //     Log.info("returning");
        //     return this.datasets;
        // });
        //checking disk
        // fs.readdir("./data", function (err: Error, files: string[]) {
        //     if (err) {
        //         Log.error("getDatasets(): trouble reading files in directory " + err);
        //     }
        //     //for (var fileName of files) {
        //     var fileName: string = "courses.json";
        //     fs.readFile("./data/" +fileName, "utf8", function (err: Error, file: string) {
        //         if (err) {
        //             Log.error("getDatasets(): trying to read file, probably something wrong with file name " + err);
        //         }
        //         Log.info("file name before split: " + fileName);
        //         var name: string = fileName.split(".")[0];
        //         this.datasets[name] = JSON.parse(file);
        //         return this.datasets;
        //     });
        //     //}
        // })

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

    public deleteDataset(id: string): boolean{
        if (id in this.datasets) {
            delete this.datasets[id];
            fs.unlinkSync("./data/" + id + ".json");
            Log.info("deleteDataset(): deleted " + id + " succesfully!");
            return true;
        } else {
            return false;
        }
    }

    public readFile(zip: JSZip, path: string): Promise<any> {
        Log.info("readFile() start");
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
                    throw new Error("readFile(): not valid zip");
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
                    var uniqueId: number = root.result[i].id;
                    // Log.info("uniqueId: " + uniqueId);

                    var newSection = new Course (uniqueId, dept, id, title, avg, instructorArray, pass, fail, audit);
                    that.processedData.push(newSection);

                    // DEAD CODE =======================================
                    // var key: string = dept + id;
                    // if (!(key in that.processedData)) {
                    //     var newCourse: Course = new Course(dept, id);
                    //     newCourse.title = title;
                    //     // make course once per file
                    // }

                    // var courseToPush: Course;
                    // var exists: boolean = false;
                    // for (var course of that.processedData) {
                    //     if (course.dept === dept && course.id === id) {
                    //         courseToPush = course;
                    //         exists = true;
                    //     }
                    // }
                    // if (!exists) {
                    //     courseToPush = new Course(dept, id, title);
                    // }

                    //can't store bidirectional relationship in JSON :( unless serialize objects before stringify..
                    //in the interest of time not going to use instructor class -S


                    // var newSection: Section = new Section(uniqueId);
                    // newSection.average = avg;
                    // newSection.instructor = instructorArray;
                    // newSection.pass = pass;
                    // newSection.fail = fail;
                    // newSection.audit = audit;

                    // courseToPush.addSection(newSection);
                    //
                    // if (!exists) {
                    //     that.processedData.push(courseToPush);
                    // }
                } //end for loop
            }).then(function() {
                fulfill(true);
            }).catch(function (reason: any) {
                //reject(reason);
                throw Error(reason);
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
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    // iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.
                    var promises: string[] = [];
                    switch (id) {
                        case "courses":
                            zip.folder(id).forEach(function (relativePath, file) { // find name of the zipfile and replace "courses"
                                //Log.info("relativePath: " + relativePath + ", file: " + file);
                                promises.push(<any>that.readFile(zip, file.name));
                            });
                            break;
                        default:
                            throw Error("I'm not programmed to recognize this ID yet :( ");
                    }
                    Log.info("process(): all readFile promises are ready!");
                    Log.info("process(): there are " + promises.length + " files");
                    if (promises.length < 1) {
                        throw new Error("process(): Not valid dataset");
                    }
                    return Promise.all(promises);

                }).then(function(result: string[]) { //array of promises
                    that.save(id);
                    fulfill(code);
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
    private save(id: string) {
        // add it to the memory model
        this.datasets[id] = this.processedData;

        // actually write to disk in the ./data directory

        //check if directory data exits
        //bad practice, better handle the error instead and not use sync either -S
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
