/**
 * Created by rtholmes on 2016-09-03.
 */
"use strict"

import Log from "../Util";
import JSZip = require('jszip');
var fs = require('fs');                       //to use file system in node.js

// PUT
/**
 * In memory representation of all datasets.
 */
export interface Datasets {
    [id: string]: {};
}

export default class DatasetController {

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
        // TODO: this should check if the dataset is on disk in ./data if it is not already in memory.

        return this.datasets[id];
    }

    public getDatasets(): Datasets {
        // TODO: if datasets is empty, load all dataset files in ./data from disk

        return this.datasets;
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
            try {
                // creating an instance of JSZip (given)
                let myZip = new JSZip();
                // load a zip file
                myZip.loadAsync(data, {base64: true}).then(function (zip: JSZip) {
                    Log.trace('DatasetController::process(..) - unzipped');

                    let processedDataset = {};
                    // TODO: iterate through files in zip (zip.files)
                    // The contents of the file will depend on the id provided. e.g.,
                    // some zips will contain .html files, some will contain .json files.
                    // You can depend on 'id' to differentiate how the zip should be handled,
                    // although you should still be tolerant to errors.

                    //create array of promises
                    var promises: string[] = [];
                    // read the contents of a zip file
                    Log.info('DatasetController::process(..) - will start iterating over files');
                    //myZip.folder("courses").forEach(function()){
                    for(myZip.file in myZip.files){
                        //read a zip file
                        Log.info('DatasetController::process(..) - reading file: ' + myZip.file(name));
                        //myZip.file.async("string"). //TODO: fix this
                    }

                    fs.readFile("310courses.1.0", function(err, data){
                        if (err) {
                            return console.error(err,"Error reading zip file");
                        }
                        console.log("Asynchronous reading of files has occurred");
                       // JSZip.loadAsync(data).then(function(zip)){
                        //}
                        })


                    that.save(id, processedDataset);

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

        // TODO: actually write to disk in the ./data directory
    }
}
