/**
 * Created by rtholmes on 2016-10-31.
 */

import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";
import {expect} from 'chai';

describe("QueryController", function () {

    beforeEach(function () {
    });

    afterEach(function () {
    });

    it("Valid query and dataset exists, should return 200", function () {
        // NOTE: this is not actually a valid query for D1
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []}; //just checking query validity so need dataset id "courses" to exist -S
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Invalid query and dataset exists, should return 400", function () {
        let query: any = null;
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Valid query and dataset doesn't exist, should return 424", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let missingIDs = controller.returnWrongIDs();

        expect(isValid).to.equal(424);
        expect(missingIDs[0]).to.equal("courses");
    });

    it("Should be able to query, although the answer will be empty", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 200}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let ret = controller.query(query);
        Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
        expect(ret).not.to.be.equal(null);
        expect(ret.result.length).to.equal(0);
    });
});