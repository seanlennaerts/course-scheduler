/**
 * Created by Sean on 10/18/16.
 */

import fs = require("fs");
import {Datasets} from "../src/controller/DatasetController";
import QueryController from "../src/controller/QueryController";
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

    it("Simple query check", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept"],
            "WHERE": {"GT": {"courses_avg": 75}},
            "ORDER": "courses_dept",
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;
            Log.info("Size of result array should be 2: " + result.length);
            Log.info("GOT HERE?");
            Log.info("FATAL ERROR:: SEAN, I am watching you...");
            let test: {}[] = [{courses_dept: "cpsc"}, {courses_dept: "cpsc"}];
            expect(result).to.deep.equal(test);
        }).catch(function (response: InsightResponse) {
            expect.fail("Something went wrong!");
        });
    });
});