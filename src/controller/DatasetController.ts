/**
 * Created by rtholmes on 2016-09-03.
 */
"use strict"; //nice find :) -S

import Log from "../Util";
import JSZip = require('jszip');
import Course from "../model/Course";
import {ASTNode} from "parse5";
import Room from "../model/Room";
var fs = require('fs');
var parse5 = require('parse5');
var http = require('http');

/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: Course[];
}

export default class DatasetController {

    private processedData: any[]  = [];
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
            // this.datasets["courses"] = JSON.parse(file);
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

    private readFileZip(zip: JSZip, path: string): Promise<any> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            zip.file(path).async("string").then(function (contents: string) {
                //Log.info(contents);
                var root = JSON.parse(contents);
                //Log.info("readFile(): there are " + root.result.length + " sections in " + path);
                // if (root.result.length === 0) {
                //     Log.info("readFile(): " + path + " has no sections!")
                //     countMissingSections++;
                // }
                if (!root.result) {
                    // Log.info("readFile(): not valid zip");
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

    public searchAST(root: ASTNode, nodeNameOfFinalValue: string, attrValue: string, parentNodeName: string, instance: number): string {
        //for debugging
        // if (root.value && !root.value.includes("\n")) {
        //     Log.info("Found root value: " + root.value);
        // }
        // end for debugging

        if (root.nodeName === nodeNameOfFinalValue && root.parentNode.attrs && JSON.stringify(root.parentNode.attrs).includes(attrValue) && root.parentNode.nodeName === parentNodeName) {
            // Log.info("Found an instance!: " + root.value);
            return root.value;
        }
        var result: string = null;
        if (root.childNodes) {
            Log.info("Found children: " + root.childNodes.length);
            var children: ASTNode[] = root.childNodes;
            for (var i = 0; instance > -1 && i < children.length; i++) {
                var temp = this.searchAST(children[i], nodeNameOfFinalValue, attrValue, parentNodeName, instance);
                if (temp != null) {
                    Log.info("Found an instance!: " + temp);
                    instance--;
                    result = temp;
                }
                if (instance === -1) {
                    Log.info("Found final instance!: " + temp);
                    result = temp.trim();
                }
            }
        }
        return result;
    }

    public getSmallerSection(root: ASTNode, id: string, attr?: string): ASTNode {
        if (root.nodeName === id && !attr) {
            return root;
        }
        if (root.nodeName === id && attr && JSON.stringify(root.attrs).includes(attr)) {
            return root;
        }
        var result: ASTNode = null;
        if (root.childNodes) {
            var children: ASTNode[] = root.childNodes;
            for (var i = 0; result === null && i < children.length; i++) {
                result = this.getSmallerSection(children[i], id, attr);
            }
        }
        return result;
    }

    private cleanHTML(html: string): string {
        return html.replace(/\r?\n|\r/g, "").replace(/\>\s*\</g, "><");
    }

    private getLatLon(address: string): Promise<any> {
        address = encodeURI(address);
        var url: string = "http://skaha.cs.ubc.ca:8022/api/v1/team2/" + address;
        var that = this;
        return new Promise (function (fulfill, reject) {
            const request = http.get(address, (response: any) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                // temporary data holder
                const body: string[] = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk: string) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => fulfill(JSON.parse(body.join(''))));
            });
            // handle connection errors of the request
            request.on('error', (err: Error) => reject(err))
        });
    }


    private readFileHtml(zip: JSZip, path: string): Promise<any> {
        var that = this;
        return new Promise(function (fulfill, reject) {
            //TODO
            zip.file(path).async("string").then(function (contents: string) {
                contents = that.cleanHTML(contents);

                let shortname: string = path;
                let fullname: string = null;
                let number: string = null;
                let address: string = null;
                let lat: number = null;
                let lon: number = null;
                let seats: number = null;
                let type: string = null;
                let furniture: string = null;
                let href: string = null;

                var document: ASTNode = parse5.parse(contents);
                var main: ASTNode = that.getSmallerSection(document, "div", "view-buildings-and-classrooms");
                var buildingInfoFrag: ASTNode = that.getSmallerSection(main, "div", "buildling-info");
                var tbodyFrag: ASTNode = that.getSmallerSection(main, "tbody");

                fullname = that.searchAST(buildingInfoFrag, "#text", "field-content", "span", 0);
                address = that.searchAST(buildingInfoFrag, "#text", "field-content", "div", 0);
                var tableRowArray: ASTNode[] = [];
                for (var node of tbodyFrag.childNodes) {
                    tableRowArray.push(that.getSmallerSection(node, "tr"));
                }
                for (var row of tableRowArray) {
                    number = that.searchAST(row, "#text", "Room Details", "a", 0);
                    seats = Number.parseInt(that.searchAST(row, "#text", "room-capacity", "td", 0));
                    type = that.searchAST(row, "#text", "room-type", "td", 0);
                    furniture = that.searchAST(row, "#text", "room-furniture", "td", 0);
                    href = that.getSmallerSection(row, "a", "http").attrs[0].value;
                }

                return that.getLatLon(address).then(function (latlon) {
                    var llObject: {lat: number, lon: number} = latlon;
                    lat = llObject.lat;
                    lon = llObject.lon;

                    //added this code in here to control flow?
                    var room = new Room(fullname, shortname, number, shortname + number, address, lat, lon, seats, type, furniture, href);
                    that.processedData.push(room);
                }).catch(function (err: Error) {
                    reject(err);
                });
            }).then(function() {
                fulfill(true);
            }).catch(function (err: Error) {
                reject(err);
            })
        });
    }

    private parseIndex(index: JSZipObject): Promise<string[]> {
        var that = this;
        return new Promise(function (fulfill, reject) {
            var buildingsArray: string[];
            //TODO
            index.async("string").then(function(contents: string){
                var document: ASTNode = parse5.parse(contents);
                var documentFragment = parse5.parseFragment('<tbody></tbody>');
            }).then(function(){
                fulfill(buildingsArray);
            }).catch(function(err: Error){
                reject(err);
            })
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
            code = 204;
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
                    switch (id) {
                        case "courses":
                            zip.folder(id).forEach(function (relativePath, file) {
                                promises.push(<any>that.readFileZip(zip, file.name));
                            });
                            break;
                        case "rooms":
                            var indexBuildings: string[] = [];
                            return that.parseIndex(zip.folder(id).file("index.htm")).then(function(fulfill){
                                indexBuildings = fulfill;
                                zip.folder(id).folder("campus").folder("discover").folder("buildings-and-classrooms").forEach(function (relativePath, file) {
                                    if (indexBuildings.includes(file.name)) {
                                        promises.push(<any>that.readFileHtml(zip, file.name));
                                    } else {
                                        Log.info("rejecting: " + file.name);
                                    }
                                });
                            }).catch(function(){
                                throw new Error("Invalid dataset");
                            });
                            break;
                        default:
                            throw new Error("Invalid id");
                    }

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
                // Log.trace('DatasetController::process(..) - ERROR: ' + err);
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
                // Log.error("save(): Error saving file after process " + err);
                throw err;
            }
            Log.info("save(): " + id + ".json was saved succesfully!");
        });

        this.processedData = [];
    }
}
