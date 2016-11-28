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
    [id: string]: any[];
}

export interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class DatasetController {

    private processedData: any[]  = [];
    public datasets: Datasets = {};
    private validIDs: string[] = ["courses", "rooms"];

    constructor() {
        Log.trace('DatasetController::init()');
    }

    private getPersisted(id: string) {
        var file: string = fs.readFileSync("./data/" + id + ".json", "utf8");
        if (id === "courses") {
            this.parseAgain(JSON.parse(file));
        } else {
            this.parseAgainHTML(JSON.parse(file));
        }
        this.datasets[id] = this.processedData;
        this.processedData = [];
    }

    public getDatasets(): Datasets {
        if (Object.keys(this.datasets).length === this.validIDs.length && this.datasets["courses"].length > 0 && this.datasets["rooms"].length > 0) {
            Log.info("getDatasets(): already exists so returning existing datasets");
            return this.datasets;
        }
        for (var id of this.validIDs) {
            if (!(id in this.datasets)) {
                try {
                    this.getPersisted(id);
                } catch (err) {
                    Log.info("Couldn't find " + id + "!");
                }
            }
        }
        return this.datasets;
    }

    private parseAgain(json: any) {
        Log.info("getDatasets(): Parse again COURSE");
        for (var i = 0; i < json.length; i++) {
            var dept: string = json[i]._dept;
            var id: string = json[i]._id;
            var avg: number = json[i]._avg;
            var instructor: string[] = json[i]._instructor;
            var title: string = json[i]._title;
            var pass: number = json[i]._pass;
            var fail: number = json[i]._fail;
            var audit: number = json[i]._audit;
            var uniqueId: number = json[i]._uuid;
            var year: number = json[i]._year;
            var size: number = json[i]._size;

            var newCourse: Course = new Course(uniqueId, dept, id, title, avg,
                instructor, pass, fail, audit, year, size);

            this.processedData.push(newCourse);
        }
    }

    private parseAgainHTML(json: any) {
        Log.info("getDatasets(): Parse again ROOM");
        for (var i = 0; i < json.length; i++) {
            var fullname: string = json[i]._fullname;
            var shortname: string = json[i]._shortname;
            var number: string = json[i]._number;
            var address: string = json[i]._address;
            var lat: number = json[i]._lat;
            var lon: number = json[i]._lon;
            var seats: number = json[i]._seats;
            var type: string = json[i]._type;
            var furniture: string = json[i]._furniture;
            var href: string = json[i]._href;

            var newRoom: Room = new Room(fullname, shortname, number, shortname + number, address, lat, lon,
                                        seats, type, furniture, href);

            this.processedData.push(newRoom);
        }
    }

    public deleteDataset(id: string): number{
        var code: number = 404;
        if (id in this.datasets) {
            Log.info("deleteDataset(): " + id + " found in memory!");
            delete this.datasets[id];
            code = 204;
        }
        try {
            fs.unlinkSync("./data/" + id + ".json");
            code = 204;
        } catch (err) {
            Log.info("deleteDataset(): " + id + ".json not found on disk!");
        }
        Log.info("deleteDataset(): returning " + code);
        return code;
    }

    private readFileZip(file: JSZipObject): Promise<any> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            file.async("string").then(function (contents: string) {
                var root = JSON.parse(contents);
                if (!root.result) {
                    reject(new   Error("Invalid archive"));
                }
                for (var i = 0; i < root.result.length; i++) {
                    if (root.result[i].Section === "overall") {
                        break;
                    }
                    var dept: string = root.result[i].Subject;
                    var id: string = root.result[i].Course;
                    var avg: number = root.result[i].Avg;
                    var instructor: string = root.result[i].Professor; //lower case lastname, firstname
                    var instructorArray: string[] = instructor.split(";");
                    var title: string = root.result[i].Title;
                    var pass: number = root.result[i].Pass;
                    var fail: number = root.result[i].Fail;
                    var audit: number = root.result[i].Audit;
                    var uuid: number = root.result[i].id;
                    var year: number = root.result[i].Year;

                    var newSection = new Course (uuid, dept, id, title, avg, instructorArray, pass, fail, audit, year, pass + fail);
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
            var children: ASTNode[] = root.childNodes;
            for (var i = 0; instance > -1 && i < children.length; i++) {
                var temp = this.searchAST(children[i], nodeNameOfFinalValue, attrValue, parentNodeName, instance);
                if (temp != null) {
                    // Log.info("Found an instance!: " + temp);
                    instance--;
                    result = temp;
                }
                if (instance === -1) {
                    // Log.info("Found final instance!: " + temp);
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

    private getLatLon(address: string): Promise<GeoResponse> {
        address = encodeURI(address);
        var options: {} = {
            hostname: "skaha.cs.ubc.ca",
            port: 8022,
            path: "/api/v1/team2/" + address
        };
        return new Promise (function (fulfill, reject) {
            //FROM STACK OVERFLOW
            const request = http.get(options, (response: any) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                    reject(new Error('Failed to load page, status code: ' + response.statusCode));
                }
                // temporary data holder
                const body: string[] = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk: string) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => fulfill(JSON.parse(body.join('')))); // added JSON.parse -S
            });
            // handle connection errors of the request
            request.on('error', (err: Error) => reject(err))
        });
    }

    private readFileHtml(file: JSZipObject): Promise<any> {
        var that = this;
        return new Promise(function (fulfill, reject) {
            file.async("string").then(function (contents: string) {
                contents = that.cleanHTML(contents);

                let shortname: string = file.name.split("/")[file.name.split("/").length - 1];
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
                var buildingInfoFrag: ASTNode = that.getSmallerSection(main, "div", "building-info");
                var tbodyFrag: ASTNode = that.getSmallerSection(main, "tbody");
                if (tbodyFrag) {
                    fullname = that.searchAST(buildingInfoFrag, "#text", "field-content", "span", 0);
                    address = that.searchAST(buildingInfoFrag, "#text", "field-content", "div", 0);
                    var tableRowArray: ASTNode[] = [];
                    for (var node of tbodyFrag.childNodes) {
                        tableRowArray.push(that.getSmallerSection(node, "tr"));
                    }
                    return that.getLatLon(address).then(function (latlon: GeoResponse) {
                        // Log.info("getLatLon returned: " + JSON.stringify(latlon));
                        lat = latlon.lat;
                        lon = latlon.lon;
                        for (var row of tableRowArray) {
                            number = that.searchAST(row, "#text", "Room Details", "a", 0);
                            seats = Number.parseInt(that.searchAST(row, "#text", "room-capacity", "td", 0));
                            type = that.searchAST(row, "#text", "room-type", "td", 0);
                            furniture = that.searchAST(row, "#text", "room-furniture", "td", 0);
                            href = that.getSmallerSection(row, "a", "http").attrs[0].value;
                            var room = new Room(fullname, shortname, number, shortname + "_" + number, address, lat, lon, seats, type, furniture, href);
                            that.processedData.push(room);
                        }
                    }).catch(function (err: Error) {
                        Log.error("Error finding latlon: " + err);
                        reject(err);
                    });
                }
            }).then(function() {
                fulfill(true);
            }).catch(function (err: Error) {
                reject(err);
            })
        });
    }

    // private parseIndex(index: JSZipObject): Promise<string[]> {
    //     Log.info("DatasetController:: parseIndex(): starting");
    //     var that = this;
    //     return new Promise(function (fulfill, reject) {
    //         var buildingsCodeArray: string[] = [];
    //         index.async("string").then(function(contents: string){
    //             contents = that.cleanHTML(contents);
    //             var document: ASTNode = parse5.parse(contents);
    //             var main: ASTNode = that.getSmallerSection(document, "tbody");
    //             for (var tBodyRow of main.childNodes){
    //                 var buildingCode = that.searchAST(main, "#text", "value", "td", 0);
    //                 buildingsCodeArray.push(buildingCode);
    //             }
    //         }).then(function(){
    //             Log.info("DatasetController:: parseIndex(): Yay Ana! it worked nicely :)");
    //             fulfill(buildingsCodeArray);
    //         }).catch(function(err: Error){
    //             Log.info("DatasetController:: parseIndex(): Boo Ana... It sucks");
    //             reject(err);
    //         })
    //     });
    // }

    /**
     * Process the dataset; save it to disk when complete.
     *
     * @param id
     * @param data base64 representation of a zip file
     * @returns {Promise<boolean>} returns true if successful; false if the dataset was invalid (for whatever reason)
     */
    public process(id: string, data: any): Promise<number> {
        Log.trace('DatasetController::process( ' + id + '... )');
        let that = this;
        return new Promise(function (fulfill, reject) {
            var code: number = (id in that.datasets) ? 201 : 204;
            Log.info("process(): start");
            that.processedData = [];
            try {
                let myZip = new JSZip();
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');
                    var promises: string[] = [];
                    switch (id) {
                        case "courses":
                            Log.info("it is case" + id);
                            zip.folder(id).forEach(function (relativePath, file) {
                                promises.push(<any>that.readFileZip(zip.file(file.name)));
                            });
                            break;
                        case "rooms":
                            Log.info("it is case" + id);
                            var indexBuildings: string[] = ["ACU", "ALRD", "ANSO", "AERL", "ACEN", "AAC", "AUDI", "AUDX", "BINN", "BIOL", "BRKX", "BUCH", "BUTO", "CHOI", "CIRS", "CHAN", "CHBE", "CHEM", "CEME", "COPP", "DLAM", "HSCC", "DSOM", "KENN", "EOSM", "ESB", "FNH", "FSC", "FORW", "KAIS", "LASR", "FRWO", "FRDM", "GEOG", "CUNN", "HEBB", "HENN", "ANGU", "GREN", "DMP", "ICCS", "IONA", "IBLC", "MCDN", "SOWK", "LSK", "LSC", "MCLD", "MCML", "MATH", "MATX", "MEDC", "MSB", "MUSC", "SCRF", "ORCH", "PHRM", "PONE", "PCOH", "PONF", "PONH", "OSBO", "SPPH", "SOJ", "SRC", "UCLL", "TFPB", "TFPX", "MGYM", "EDC", "WESB", "WMAX", "SWNG", "WOOD"];
                            zip.folder("campus").folder("discover").folder("buildings-and-classrooms").forEach(function (relativePath, file) {
                                if (indexBuildings.includes(relativePath)) {
                                    promises.push(<any>that.readFileHtml(zip.file(file.name)));
                                } else {
                                    Log.info("rejecting: " + file.name);
                                }
                            });
                            break;
                        default:
                            throw new Error("Invalid id");
                    }
                    return Promise.all(promises);
                }).then(function (presult) {
                    Log.info("process(): all readFile promises are ready!");
                    Log.info("process(): there are " + presult.length + " valid files");
                    if (presult.length === 0) {
                        reject(new Error("Invalid dataset"));
                    }
                    that.save(id);
                    fulfill(code);
                }).catch(function (err: Error) {
                    Log.trace('DatasetController::process(..) - unzip ERROR: ' + err.message);
                    reject(new Error("Invalid archive"));
                });
            } catch (err) {
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
        fs.writeFile("./data/" + id + ".json", toWrite, function (err: Error) {
            if (err) {
                // Log.error("save(): Error saving file after process " + err);
                throw err;
            }
            Log.info("save(): " + id + ".json was saved succesfully!");
        });

        this.processedData = [];
    }
}
