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

    // it("Should be able to validate a valid query", function () {
    //     // NOTE: this is not actually a valid query for D1
    //     let query: QueryRequest = {
    //         "GET": ["courses_dept", "courses_avg"],
    //         "WHERE": {"GT": {"courses_avg": 90}},
    //         "ORDER": "courses_avg",
    //         "AS": "TABLE"
    //     };
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let isValid = controller.isValid(query);
    //
    //     expect(isValid).to.equal(true);
    // });

    it("Should be able to invalidate an invalid query - null query", function () {
        let query: any = null;
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate an invalid query - wrong mcomparator", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GET" : {"courses_avg" : 90}},
            "ORDER" : "courses_pass",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate an invalid query - wrong field", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avo" : 90}},
            "ORDER" : "courses_pass",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to validate a query without ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "AS" : "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });


    it("Should be able to invalidate an invalid query - wrong AS key", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GET" : {"courses_avg" : 90}},
            "ORDER" : "courses_pass",
            "AS" : "TABL"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate an invalid query - wrong dataset ID in GET", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "course_avg"],
            "WHERE" : {"GET" : {"courses_avg" : 90}},
            "ORDER" : "courses_pass",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });


    it("Should be able to invalidate an invalid query - ORDER key not in GET key ", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_pass",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to validate most basic valid query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Should be able to validate complex query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {"OR": [{"AND": [{"GT": {"courses_avg": 70}},{"IS": {"courses_dept": "adhe"}}]},{"EQ": {"courses_avg": 90}}]},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Shoulb be a valid nested three-level query", function () {
        let query: QueryRequest = {
            "GET": [
                "courses_dept",
                "courses_id",
                "courses_avg"
            ],
            "WHERE": {"OR": [{"AND": [{"AND": [{"GT": {"courses_avg": 70}}, {"LT": {"courses_avg": 80}}]}, {"IS": {"courses_dept": "adhe"}}]},{"EQ": {"courses_avg": 90}}]},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });



    // it("Should be able to query, although the answer will be empty", function () {
    //     // NOTE: this is not actually a valid query for D1, nor is the result correct.
    //     let query: QueryRequest = {
    //         "GET": ["courses_dept", "courses_avg"],
    //         "WHERE": {"GT": {"courses_avg": 200}},
    //         "ORDER": "courses_avg",
    //         "AS": "TABLE"
    //     };
    //     let dataset: Datasets = {};
    //     let controller = new QueryController(dataset);
    //     let ret = controller.query(query);
    //     Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
    //     expect(ret).not.to.be.equal(null);
    //     // should check that the value is meaningful
    // });
});