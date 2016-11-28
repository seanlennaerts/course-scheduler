import {DistanceRequest, default as DistanceController, DistanceResponse} from "../src/controller/DistanceController";
import Log from "../src/Util";
import {expect} from 'chai';
import InsightFacade from "../src/controller/InsightFacade";
import {InsightResponse} from "../src/controller/IInsightFacade";

/**
 * Created by Sean on 11/27/16.
 */

describe("RoomDistanceTest", function () {

    var facade: InsightFacade = null;
    before(function () {
    });

    beforeEach(function () {
        facade = new InsightFacade();
    });

    afterEach(function () {
    });

    it("Rooms within 100 from DMP", function () {
        let query: DistanceRequest = {shortname: "DMP", range: 100};
        return facade.checkDistance(query).then(function (response: InsightResponse) {
            let listOfShortNamesInRance: DistanceResponse = <DistanceResponse>response.body;
            expect(listOfShortNamesInRance).to.deep.equal({shortnames: ["DMP"]});
        })
    });

    it("Rooms within 200 from DMP", function () {
        let query: DistanceRequest = {shortname: "DMP", range: 200};
        return facade.checkDistance(query).then(function (response: InsightResponse) {
            let listOfShortNamesInRance: DistanceResponse = <DistanceResponse>response.body;
            expect(listOfShortNamesInRance).to.deep.equal({shortnames: []});
        })
    });

    it("Rooms within 1000 from DMP", function () {
        let query: DistanceRequest = {shortname: "DMP", range: 1000};
        return facade.checkDistance(query).then(function (response: InsightResponse) {
            let listOfShortNamesInRance: DistanceResponse = <DistanceResponse>response.body;
            expect(listOfShortNamesInRance).to.deep.equal({shortnames: []});
        })
    });

    it("Rooms within 500 from ANGU", function () {
        let query: DistanceRequest = {shortname: "ANGU", range: 500};
        return facade.checkDistance(query).then(function (response: InsightResponse) {
            let listOfShortNamesInRance: DistanceResponse = <DistanceResponse>response.body;
            expect(listOfShortNamesInRance).to.deep.equal({shortnames: []});
        })
    });
});