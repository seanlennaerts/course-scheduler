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
            let expectedResult: {}[] = [{courses_dept: "cpsc"}, {courses_dept: "cpsc"}];

            Log.test("GT:\n" + JSON.stringify(result));
            expect(result).to.deep.equal(expectedResult);
            expect(result.length).to.equal(2);
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

});