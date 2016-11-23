/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';
var fs = require('fs');
import InsightFacade from "../src/controller/InsightFacade";
import {Datasets} from "../src/controller/DatasetController";

describe("DatasetController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Should be able to reject an invalid Dataset", function () {
        Log.test('Creating dataset');
        let content = {key: 'value'};
        let zip = new JSZip();
        zip.file('content.obj', JSON.stringify(content));
        const opts = {
            compression: 'deflate', compressionOptions: {level: 2}, type: 'base64'
        };

        return zip.generateAsync(opts).then(function (data) {
            Log.test('Dataset created');
            let controller = new DatasetController();
            return controller.process("courses", data);
        }).then(function (result) {
            expect.fail();
            // should not be valid
        }).catch(function (err) {
            Log.test("Reached catch because process threw error: " + err);
            expect(err).to.be.an("error");
        });
    });
    /*

    it("Get persisted datasets, nothing in memory", function () {
        let controller = new DatasetController();
        controller.datasets = {};
        try {
            fs.unlinkSync("./data/" + "courses" + ".json");
        } catch (err) {
            Log.info("Courses dataset wasn't persisted");
        }
        try {
            fs.unlinkSync("./data/" + "rooms" + ".json");
        } catch (err) {
            Log.info("Rooms dataset wasn't persisted");
        }
        var zipFileContents: string = new Buffer(fs.readFileSync('./test-datasets/coursesTESTS.zip')).toString('base64');
        return controller.process("courses", zipFileContents).then(function(result){
            var courseDataset: any = controller.datasets["courses"];
            controller.datasets= {};
            var ds: any = controller.getDatasets()["courses"];
            expect(ds).to.deep.equal(courseDataset);
        });
    });

    it("Get persisted datasets, nothing in memory", function () {
        let controller = new DatasetController();
        controller.datasets = {};
        try {
            fs.unlinkSync("./data/" + "courses" + ".json");
        } catch (err) {
            Log.info("Courses dataset wasn't persisted");
        }
        try {
            fs.unlinkSync("./data/" + "rooms" + ".json");
        } catch (err) {
            Log.info("Rooms dataset wasn't persisted");
        }
        var zipFileContents: string = new Buffer(fs.readFileSync('./test-datasets/310rooms.1.1.zip')).toString('base64');
        return controller.process("rooms", zipFileContents).then(function(result){
            var roomsDataset: any = controller.datasets["rooms"];
            controller.datasets= {};
            var ds: any = controller.getDatasets()["rooms"];
            expect(ds).to.deep.equal(roomsDataset);
        });
    });


    it("Invalid archive", function () {

    })
    */

});