/**
 * Created by Sean on 11/14/16.
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

    it("Check room max", function () {
        let query: QueryRequest = {
            "GET": ["rooms_shortname", "numRooms"],
            "WHERE": {},
            "GROUP": [ "rooms_shortname" ],
            "APPLY": [ {"numRooms": {"MAX": "rooms_seats"}} ],
            "AS": "TABLE"
        };
        return facade.performQuery(query).then(function (response: InsightResponse) {
            let table: QueryResponse = <QueryResponse>response.body;
            let result: {}[] = table.result;

            Log.test("GT:\n" + JSON.stringify(result));
            expect(result.length).to.equal(76);
        });
    });
});