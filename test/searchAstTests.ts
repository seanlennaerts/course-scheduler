/**
 * Created by Sean on 11/3/16.
 */

import {expect} from 'chai';
import DatasetController from "../src/controller/DatasetController";
var parse5 = require('parse5');
var fs = require('fs');

describe("searchAstTests", function () {

    var file: string = null;
    before(function () {
        file = fs.readFileSync("./DMP", "utf8");
    });

    it("try finding building longname", function () {
        var document = parse5.parse(file);
        var dataContorller: DatasetController = new DatasetController;
        var found: string = dataContorller.searchAST(document, "#text", "field-content", "span", 0);
        expect(found).to.equal("Hugh Dempster Pavilion");
    });

    it("try finding building address", function () {
        var document = parse5.parse(file);
        var dataContorller: DatasetController = new DatasetController;
        var found: string = dataContorller.searchAST(document, "#text", "field-content", "div", 0);
        expect(found).to.equal("6245 Agronomy Road V6T 1Z4");
    });

    it("try finding room number", function () {
        var document = parse5.parse(file);
        var dataContorller: DatasetController = new DatasetController;
        var found: string = dataContorller.searchAST(document, "#text", "Room Details", "a", 0);
        expect(found).to.equal("101");
    });

    it("try finding second room number", function () {
        var document = parse5.parse(file);
        var dataContorller: DatasetController = new DatasetController;
        var found: string = dataContorller.searchAST(document, "#text", "Room Details", "a", 1);
        expect(found).to.equal("110");
    });

    it("try finding third room number", function () {
        var document = parse5.parse(file);
        var dataContorller: DatasetController = new DatasetController;
        var found: string = dataContorller.searchAST(document, "#text", "Room Details", "a", 2);
        expect(found).to.equal("201");
    });

    it("try finding third room capacity", function () {
        var document = parse5.parse(file);
        var dataContorller: DatasetController = new DatasetController;
        var found: string = dataContorller.searchAST(document, "#text", "room-capacity", "td", 2);
        expect(found).to.equal("40");
    });

    it("try finding third room furniture", function () {
        var document = parse5.parse(file);
        var dataContorller: DatasetController = new DatasetController;
        var found: string = dataContorller.searchAST(document, "#text", "room-furniture", "td", 2);
        expect(found).to.equal("Classroom-Movable Tables & Chairs");
    });

});