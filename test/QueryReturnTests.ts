/**
 * Created by Sean on 10/18/16.
 */

import fs = require("fs");
import {QueryRequest} from "../src/controller/QueryController";
import Log from "../src/Util";
import {expect} from 'chai';
import {QueryResponse} from "../src/controller/QueryController";
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";

describe("QueryReturns", function () {

    var facade: InsightFacade = null;
    before(function () {
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    afterEach(function () {
    });

    it("Check GT", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {"GT": {"courses_avg": 75}},
            "ORDER": "courses_dept",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "cpsc"},
                                        {courses_dept: "cpsc"}];

            Log.test("GT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(2);
        });
    });

    //TIME TO TACKLE NOT
    it("Basic NOT, should be opposite of GT 75 so LT 75", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {"NOT": {"GT": {"courses_avg": 75}}},
            "ORDER": "courses_dept",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "comm"},
                                        {courses_dept: "comm"},
                                        {courses_dept: "comm"},
                                        {courses_dept: "comm"},
                                        {courses_dept: "cpsc"}];

            Log.test("GT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(5);
        });
    });

    it("Check LT", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id"],
            "WHERE": {"LT": {"courses_avg": 75}},
            "ORDER": "courses_dept",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "comm", courses_id: "101"},
                                        {courses_dept: "comm", courses_id: "101"},
                                        {courses_dept: "comm", courses_id: "101"},
                                        {courses_dept: "comm", courses_id: "101"},
                                        {courses_dept: "cpsc", courses_id: "110"}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(5);
        });
    });

    //checking eq but also multiple GET and using Overall section with instructor
    it("Check EQ", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_title", "courses_instructor"],
            "WHERE": {"EQ": {"courses_pass": 473}},
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "comm", courses_id: "101", courses_title: "busn fundamental", courses_instructor: [""]}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(1);
        });
    });

    it("Check IS, string*", function () {
        let query: QueryRequest = {
            "GET": ["courses_title", "courses_instructor", "courses_fail"],
            "WHERE": {"IS": {"courses_title": "b*"}},
            "ORDER": "courses_fail",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_title: "busn fundamental", courses_instructor: ["jackes, robert", "kroeker, jeff", "milne, tamar"], courses_fail: 0},
                                        {courses_title: "busn fundamental", courses_instructor: ["cubbon, paul", "jackes, robert", "williamson, elaine"], courses_fail: 1},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 7},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 15}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(4);
        });
    });

    it("Check IS, *string*", function () {
        let query: QueryRequest = {
            "GET": ["courses_title", "courses_instructor", "courses_fail"],
            "WHERE": {"IS": {"courses_title": "*usn f*"}},
            "ORDER": "courses_fail",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_title: "busn fundamental", courses_instructor: ["jackes, robert", "kroeker, jeff", "milne, tamar"], courses_fail: 0},
                                        {courses_title: "busn fundamental", courses_instructor: ["cubbon, paul", "jackes, robert", "williamson, elaine"], courses_fail: 1},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 7},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 15}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(4);
        });
    });

    it("Check IS, *string", function () {
        let query: QueryRequest = {
            "GET": ["courses_title", "courses_instructor", "courses_fail"],
            "WHERE": {"IS": {"courses_title": "*fundamental"}},
            "ORDER": "courses_fail",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_title: "busn fundamental", courses_instructor: ["jackes, robert", "kroeker, jeff", "milne, tamar"], courses_fail: 0},
                                        {courses_title: "busn fundamental", courses_instructor: ["cubbon, paul", "jackes, robert", "williamson, elaine"], courses_fail: 1},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 7},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 15}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(4);
        });
    });

    it("Check IS, *string", function () {
        let query: QueryRequest = {
            "GET": ["courses_title", "courses_instructor", "courses_fail"],
            "WHERE": {"IS": {"courses_title": "*fundamental"}},
            "ORDER": "courses_fail",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_title: "busn fundamental", courses_instructor: ["jackes, robert", "kroeker, jeff", "milne, tamar"], courses_fail: 0},
                                        {courses_title: "busn fundamental", courses_instructor: ["cubbon, paul", "jackes, robert", "williamson, elaine"], courses_fail: 1},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 7},
                                        {courses_title: "busn fundamental", courses_instructor: [""], courses_fail: 15}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(4);
        });
    });

    it("Check IS, *g* (for gregor and one other prof)", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {"IS": {"courses_instructor": "*g*"}},
            "ORDER": "courses_instructor",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "cpsc", courses_id: "110", courses_instructor: ["kiczales, gregor"]},
                                        {courses_dept: "cpsc", courses_id: "110", courses_instructor: ["mcgrenere, joanna"]}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(2);
        });
    });

    it("Check ORDER with multiple instructors", function () {
        let query: QueryRequest = {
            "GET": ["courses_title", "courses_instructor", "courses_fail"],
            "WHERE": {"IS": {"courses_instructor": "jackes, robert"}},
            "ORDER": "courses_instructor",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_title: "busn fundamental", courses_instructor: ["cubbon, paul", "jackes, robert", "williamson, elaine"], courses_fail: 1},
                                        {courses_title: "busn fundamental", courses_instructor: ["jackes, robert", "kroeker, jeff", "milne, tamar"], courses_fail: 0}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(2);
        });
    });

    it("~EMBIGGEN~, sorting by courses_audit", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_audit"],
            "WHERE": {"GT": {"courses_pass": 0}}, // all 7 sections
            "ORDER": "courses_audit",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "comm", courses_audit: 0},
                                        {courses_dept: "comm", courses_audit: 0},
                                        {courses_dept: "comm", courses_audit: 0},
                                        {courses_dept: "comm", courses_audit: 0},
                                        {courses_dept: "cpsc", courses_audit: 0},
                                        {courses_dept: "cpsc", courses_audit: 0},
                                        {courses_dept: "cpsc", courses_audit: 5}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(7);
        });
    });

    it("~EDISON~, sorting by courses_instructor", function () {
        let query: QueryRequest = {
            "GET": ["courses_instructor"],
            "WHERE": {"GT": {"courses_pass": 0}}, // all 7 sections
            "ORDER": "courses_instructor",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_instructor: [""]},
                                        {courses_instructor: [""]},
                                        {courses_instructor: [""]},
                                        {courses_instructor: ["cubbon, paul", "jackes, robert", "williamson, elaine"]},
                                        {courses_instructor: ["jackes, robert", "kroeker, jeff", "milne, tamar"]},
                                        {courses_instructor: ["kiczales, gregor"]},
                                        {courses_instructor: ["mcgrenere, joanna"]}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(7);
        });
    });

    it("~CYCLONE~, q3 from public suite (might be inaccurate because small dataset)", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "cpsc", courses_id: "110", courses_instructor: [""]},
                                        {courses_dept: "cpsc", courses_id: "110", courses_instructor: ["kiczales, gregor"]},
                                        {courses_dept: "cpsc", courses_id: "110", courses_instructor: ["mcgrenere, joanna"]}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.include.members(expectedResult);
            expect(result.length).to.equal(3);
        });
    });

    it("Check OR", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {
                "OR": [
                    {"GT": {"courses_avg": 75}},
                    {"IS": {"courses_dept": "comm"}}
                ]
            },
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "comm", courses_id: "101", courses_avg: 72.34},
                                        {courses_dept: "comm", courses_id: "101", courses_avg: 72.76},
                                        {courses_dept: "comm", courses_id: "101", courses_avg: 73.24},
                                        {courses_dept: "comm", courses_id: "101", courses_avg: 74.12},
                                        {courses_dept: "cpsc", courses_id: "110", courses_avg: 76.94},
                                        {courses_dept: "cpsc", courses_id: "110", courses_avg: 77.43}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(6);
        });
    });

    // **************************   D2 tests *********************************

    it("Testing empty WHERE", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {},
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;

            expect(result.length).to.equal(7);
        });
    });

    it("First test of GROUP and APPLY", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAvg"],
            "WHERE": {},
            "GROUP": ["courses_dept", "courses_id"],
            "APPLY": [{"courseAvg": {"AVG": "courses_avg"}}],
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_dept: "cpsc", courses_id: "110", courseAvg: 75.15},
                                        {courses_dept: "comm", courses_id: "101", courseAvg: 73.12}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.include.members(expectedResult);
            expect(result.length).to.equal(2);
        });
    });

    it("Given group and apply test 2", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            //"ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_id: "110", courseAverage: 75.15}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.include.members(expectedResult);
            expect(result.length).to.equal(1);
        });
    });

    it("Check order", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_id: "110", courseAverage: 75.15}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.include.members(expectedResult);
            expect(result.length).to.equal(1);
        });
    });

    it("Check order descending", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "maxPass"],
            "WHERE": {},
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"maxPass": {"MAX": "courses_pass"}} ],
            "ORDER": { "dir": "DOWN", "keys": ["maxPass", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_id: "101", maxPass: 662},
                                        {courses_id: "110", maxPass: 180}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(2);
        });
    });

    it("Check order ascending", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "maxPass"],
            "WHERE": {},
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"maxPass": {"MAX": "courses_pass"}} ],
            "ORDER": { "dir": "UP", "keys": ["maxPass", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            let expectedResult: {}[] = [{courses_id: "110", maxPass: 180},
                                        {courses_id: "101", maxPass: 662}];

            Log.test("LT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(2);
        });
    });

    //increase code coverage
    it("Check IS instructor *gregor", function () {
        let query: QueryRequest = {
            "GET": ["courses_id"],
            "WHERE": {"IS": {"courses_instructor": "*gregor"}},
            "AS":"TABLE"
        };
        return facade.performQuery(query);
    });

    it("Check IS instructor gregor*", function () {
        let query: QueryRequest = {
            "GET": ["courses_id"],
            "WHERE": {"IS": {"courses_instructor": "gregor*"}},
            "AS":"TABLE"
        };
        return facade.performQuery(query);
    });

    it("Check MIN", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "minPass"],
            "WHERE": {},
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"minPass": {"MIN": "courses_pass"}} ],
            "ORDER": { "dir": "UP", "keys": ["minPass", "courses_id"]},
            "AS":"TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;

            expect(result.length).to.equal(2);
        });
    });

    it("Check COUNT with string type", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "numTitle"],
            "WHERE": {},
            "GROUP": [ "courses_dept" ],
            "APPLY": [ {"numTitle": {"COUNT": "courses_title"}} ],
            "AS":"TABLE"
        };
        return facade.performQuery(query);
    });
});
