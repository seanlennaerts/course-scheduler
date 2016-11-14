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

    it("Valid query and dataset exists, most basic valid query, should return 200", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {"courses": []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Invalid: null query and dataset exists, should return 400", function () {
        let query: any = null;
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - wrong dataset ID in GET, should return 424", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "course_avg"],
            "WHERE" : {"GET" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let missingIDs = controller.returnWrongIDs();

        expect(isValid).to.equal(424);
        expect(missingIDs[0]).to.equal("course");

    });

    it("Invalid query - wrong mcomparator, should return 400", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GET" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []}; //just checking query validity so need dataset id "courses" to exist -S
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - wrong field (avo instead of avg)", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avo" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
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
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Should be able to invalidate an invalid query - wrong AS key", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GET" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABL"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate an invalid query - ORDER key not in GET keys ", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_pass",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to validate complex query", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {"OR": [{"AND": [{"GT": {"courses_avg": 70}},{"IS": {"courses_dept": "adhe"}}]},{"EQ": {"courses_avg": 90}}]},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Should be able to validate query with ORDER from D2 but no GROUP/APPLY", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {"OR": [{"AND": [{"GT": {"courses_avg": 70}},{"IS": {"courses_dept": "adhe"}}]},{"EQ": {"courses_avg": 90}}]},
            "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
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
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    // it("Should be able to query, although the answer will be empty", function () {
    //     let query: QueryRequest = {
    //         "GET": ["courses_dept", "courses_avg"],
    //         "WHERE": {"GT": {"courses_avg": 200}},
    //         "ORDER": "courses_avg",
    //         "AS": "TABLE"
    //     };
    //     let dataset: Datasets = {courses: []};
    //     let controller = new QueryController(dataset);
    //     let ret = controller.query(query);
    //
    //     Log.test('In: ' + JSON.stringify(query) + ', out: ' + JSON.stringify(ret));
    //     expect(ret).not.to.be.equal(null);
    //     expect(ret.result.length).to.equal(0);
    // });

    it("Should be able to invalidate an invalid query - empty GET array", function () {
        let query: QueryRequest = {
            "GET": [],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Valid query - empty WHERE object returns all rows", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Should be able to invalidate an invalid query - empty ORDER string", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate an invalid query - empty AS string", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : ""
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to validate query with wrong order of query keys", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "AS": "TABLE",
            "WHERE": {"OR": [{"AND": [{"GT": {"courses_avg": 70}},{"IS": {"courses_dept": "adhe"}}]},{"EQ": {"courses_avg": 90}}]},
            "ORDER": "courses_avg"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Invalid query - wrong datasetID in ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "course_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let missingIDs = controller.returnWrongIDs();

        expect(isValid).to.equal(424); // Should be 424 because missing dependency -S
        expect(missingIDs[0]).to.equal("course");
    });

    it("Should be able to invalidate an invalid query - wrong field in WHERE", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avo" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - 'something 'dataset ID in WHERE not yet PUT", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {something: []}; // should leave datasets empty, or put different dataset -S
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let missingIDs = controller.returnWrongIDs();

        expect(isValid).to.equal(424);
        expect(missingIDs[0]).to.equal("courses");
        expect(missingIDs.length).to.equal(1);
    });

    it("Should be able to invalidate an invalid query - dataset ID in WHERE not yet PUT", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"course_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []}; // should leave datasets empty, or put different dataset -S
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let missingIDs = controller.returnWrongIDs();

        expect(isValid).to.equal(424);
        expect(missingIDs[0]).to.equal("course");
    });


    it("Should be able to invalidate an invalid query - key in GET not valid", function () {
        let query: QueryRequest = {
            "GET": ["courses_depto", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate complex query - no datasetID in ORDER", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_avg"],
            "WHERE": {"OR": [{"AND": [{"GT": {"courses_avg": 70}},{"IS": {"courses_dept": "adhe"}}]},{"EQ": {"courses_avg": 90}}]},
            "ORDER": "avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate complex query - no datasetID in GET", function () {
        let query: QueryRequest = {
            "GET": ["dept", "courses_id", "courses_avg"],
            "WHERE": {"OR": [{"AND": [{"GT": {"courses_avg": 70}},{"IS": {"courses_dept": "adhe"}}]},{"EQ": {"courses_avg": 90}}]},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Valid query - with NOT", function(){
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
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query - supports multiple levels of AND", function(){
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "AND": [
                    {"AND": [
                        {"AND" : [
                            {"IS": {"courses_dept": "ENGL"}},
                            {"LT" : {"courses_avg" : 90}}
                        ]},
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query - supports 5 levels of OR", function(){
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "OR": [
                    {"OR": [
                        {"OR" : [
                            {"OR" : [
                                {"OR": [
                                    {"IS": {"courses_instructor": "mcgrenere, joanna"}},
                                    {"IS": {"courses_instructor": "kiczales, gregor"}}
                                    ]},
                                {"GT": {"courses_avg": 92}},
                                {"LT": {"courses_avg": 52}},
                            ]},
                            {"IS": {"courses_dept": "ENGL"}},
                            {"LT" : {"courses_avg" : 90}}
                        ]},
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });



    it("Invalid query - invalid dataset in 3th level", function(){
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "AND": [
                    {"AND": [
                        {"AND" : [
                            {"IS": {"sean_dept": "ENGL"}},
                            {"LT" : {"courses_avg" : 90}}
                        ]},
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let missingIDs = controller.returnWrongIDs();

        expect(isValid).to.equal(424);
        expect(missingIDs[0]).to.equal("sean");
    });

    it("~ FESTER~ : Invalid query - invalid dataset in 5th level", function(){
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "OR": [
                    {"OR": [
                        {"OR" : [
                            {"OR" : [
                                {"OR": [
                                    {"IS": {"courses_instructor": "mcgrenere, joanna"}},
                                    {"IS": {"chacha_instructor": "kiczales, gregor"}}
                                ]},
                                {"GT": {"courses_avg": 92}},
                                {"LT": {"courses_avg": 52}},
                            ]},
                            {"IS": {"courses_dept": "ENGL"}},
                            {"LT" : {"courses_avg" : 90}}
                        ]},
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_instructor": "*gregor*"}}
                ]
            },
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let missingIDs = controller.returnWrongIDs();

        expect(isValid).to.equal(424);
        expect(missingIDs[0]).to.equal("chacha");
    });

    it("Invalid: empty query and dataset exists, should return 400", function () {
        let query: any = {};
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid: query with all fields empty and dataset exists, should return 400", function () {
        let query: QueryRequest = {
            "GET": [],
            "WHERE": {},
            "ORDER": "",
            "AS": ""
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Should be able to invalidate an invalid query - ORDER key not in GET keys ", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {"GT" : {"courses_avg" : 90}},
            "ORDER" : "courses_ana",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    // **************************   D2 tests *********************************

    it("Valid query - Simplest one, should return 200", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [ "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query#2 - Should return 200", function () {
        let query: QueryRequest = {
                "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
                "WHERE": {},
                "GROUP": [ "courses_dept", "courses_id" ],
                "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"maxFail": {"MAX": "courses_fail"}} ],
                "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
                "AS":"TABLE"
            };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query#3 - Should return 200", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query# - Moonshine - Should return 200", function () {
        let query: QueryRequest = {
        	"GET" : ["courses_dept", "courses_id", "numberOfferings", "gradeAverages", "numPasses", "avgFails"],
            "WHERE" : {"IS" : {"courses_dept": "CPSC"}},
            "GROUP" : [ "courses_id", "courses_dept"],
            "APPLY" : [ {"numberOfferings": {"COUNT": "courses_uuid"}}, {"gradeAverages":{"AVG" : "courses_avg"}}, {"numPasses" : {"COUNT" : "courses_pass"}}, {"avgFails" : {"AVG" : "courses_fail"}}],
            "ORDER" : { "dir": "DOWN", "keys": ["courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query - Nautilus - Should return 200", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "minFails", "maxAudits"],
            "WHERE":  {"AND" : [{"IS": {"courses_dept": "c*"}},{"OR" : [{"IS" : {"courses_id" : "4*"}},{"IS" : {"courses_id" : "5*"}}]}]},
            "GROUP": [ "courses_id", "courses_dept"],
            "APPLY": [ {"minFails": {"MIN": "courses_fail"}}, {"maxAudits":{"MAX" : "courses_audit"}} ],
            "ORDER": { "dir": "UP", "keys": ["minFails", "maxAudits", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query - Orion - Should return 200", function () {
        let query: QueryRequest = {
            "GET" : ["courses_dept", "courses_id", "minFails", "maxAudits"],
            "WHERE" : {"AND": [{"EQ": {"courses_avg" : 101}},{"IS": {"courses_dept": "c*"}}]},
            "GROUP" : [ "courses_id", "courses_dept"],
            "APPLY" : [ {"minFails": {"MIN": "courses_fail"}}, {"maxAudits":{"MAX" : "courses_audit"}} ],
            "ORDER" : { "dir": "UP", "keys": ["minFails", "maxAudits", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query - empty APPLY but should return 200", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [],
            "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Invalid query - empty APPLY but GET has element not from GROUP/APPLY", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });
    it("Invalid query - GROUP but no APPLY - Should return 400", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - APPLY but no GROUP - Should return 400", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - GROUP has no terms, should return 400", function () {
        let query: QueryRequest = {
            "GET": ["courses_id", "courseAverage"],
            "WHERE": {"IS": {"courses_dept": "cpsc"}} ,
            "GROUP": [],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - a GET term doesn't correspond either to GROUP or APPLY" , function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections", "courses_instructor"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - GROUP has term without underscore" , function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "numSections" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - GET underscore terms don't match with GROUP" , function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_audit", "courses_avg" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - APPLY has term with underscore" , function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courses_dept": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - APPLY doesn't have numSections defined in GET" , function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"telephone": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - AVG requested for a non-numeric key", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage", "maxFail"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_instructor"}}, {"maxFail": {"MAX": "courses_dept"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "maxFail", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - some APPLY targets are not unique", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courseAverage"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"courseAverage": {"AVG": "courses_avg"}}, {"courseAverage": {"MAX": "courses_fail"}}, {"courseAverage": {"MAX": "courses_fail"}} ],
            "ORDER": { "dir": "UP", "keys": ["courseAverage", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let APPLYduplicates = controller.returnDuplicates();


        expect(isValid).to.equal(400);
        expect(APPLYduplicates[0]).to.equal("courseAverage");
    });

    it("Invalid - dir value is empty", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_id" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - a key appearing in GROUP or APPLY cannot occur in the other", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "numSections"],
            "WHERE": {},
            "GROUP": [ "courses_dept", "courses_uuid" ],
            "APPLY": [ {"numSections": {"COUNT": "courses_uuid"}} ],
            "ORDER": { "dir": "UP", "keys": ["numSections", "courses_dept", "courses_id"]},
            "AS":"TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);
        let duplicates = controller.returnDuplicates();

        expect(isValid).to.equal(400);
        expect(duplicates[0]).to.equal("uuid");
    });

    it("Valid query - basic rooms query", function(){
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_number"],
            "WHERE": {"IS": {"rooms_shortname": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query - d1 style", function(){
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_name"],
            "WHERE": {"IS": {"rooms_shortname": "DMP"}},
            "ORDER": "rooms_name",
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query - complex rooms query", function(){
        let query: QueryRequest =  {
            "GET": ["rooms_shortname", "numRooms"],
            "WHERE": {"GT": {"rooms_seats": 160}},
            "GROUP": [ "rooms_shortname" ],
            "APPLY": [ {"numRooms": {"COUNT": "rooms_name"}} ],
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Invalid query: 424 - query for rooms when dataset is courses", function(){
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "rooms_number"],
            "WHERE": {"IS": {"rooms_shortname": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["rooms_number"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(424);
    });

    it("Invalid query - rooms keys in query when dataset is courses", function(){
        let query: QueryRequest = {
            "GET": ["courses_fullname", "courses_number"],
            "WHERE": {"IS": {"courses_shortname": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["courses_number"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query: 424 - query for courses when dataset is rooms ", function(){
        let query: QueryRequest =  {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(424);
    });

    it("Invalid query - courses keys in query when dataset is rooms", function(){
        let query: QueryRequest =  {
            "GET": ["rooms_dept", "rooms_avg"],
            "WHERE" : {"GET" : {"rooms_avg" : 90}},
            "ORDER" : "rooms_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {rooms: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - rooms and courses in IDs", function(){
        let query: QueryRequest = {
            "GET": ["rooms_fullname", "courses_avg"],
            "WHERE": {"IS": {"rooms_shortname": "DMP"}},
            "ORDER": { "dir": "UP", "keys": ["courses_avg"]},
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: [], courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - rooms and courses in GET && GROUP IDs", function(){
        let query: QueryRequest =  {
            "GET": ["courses_avg", "numRooms"],
            "WHERE": {"GT": {"rooms_seats": 160}},
            "GROUP": [ "rooms_shortname", "courses_avg"],
            "APPLY": [ {"numRooms": {"COUNT": "rooms_seats"}} ],
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: [], courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - rooms and courses in APPLY IDs", function(){
        let query: QueryRequest =  {
            "GET": ["rooms_shortname", "numRooms"],
            "WHERE": {"GT": {"rooms_seats": 160}},
            "GROUP": [ "rooms_shortname" ],
            "APPLY": [ {"numRooms": {"COUNT": "courses_avg"}} ],
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: [], courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Invalid query - rooms and courses in WHERE IDs", function(){
        let query: QueryRequest =  {
            "GET": ["rooms_shortname", "numRooms"],
            "WHERE": {"GT": {"courses_avg": 160}},
            "GROUP": [ "rooms_shortname" ],
            "APPLY": [ {"numRooms": {"COUNT": "rooms_name"}} ],
            "AS": "TABLE"
        };
        let dataset: Datasets = {rooms: [], courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
    });

    it("Valid query with new course key: year", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg", "courses_year"],
            "WHERE": {"GT": {"courses_avg": 90}},
            "ORDER": "courses_avg",
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });

    it("Valid query with new course key: year", function(){
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_id", "courses_instructor"],
            "WHERE": {
                "OR": [
                    {"AND": [
                        {"GT": {"courses_avg": 70}},
                        {"IS": {"courses_dept": "cp*"}},
                        {"NOT": {"IS": {"courses_instructor": "murphy, gail"}}}
                    ]},
                    {"IS": {"courses_year": 1990}}
                ]
            },
            "AS": "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(200);
    });
});