/**
 * Created by rtholmes on 2016-09-03.
 */

import DatasetController from "../src/controller/DatasetController";
import Log from "../src/Util";

import JSZip = require('jszip');
import {expect} from 'chai';

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

    it("Retrieve persisted dataset", function () {
        let controller = new DatasetController();
        controller.getDatasets();
        Log.warn("something");
        Log.error("something else");
    });

    it("Invalid archive", function () {

    })

});