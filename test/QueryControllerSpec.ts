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
        let dataset: Datasets = {courses: []};
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

    it("Should be able to invalidate an invalid query - empty WHERE object", function () {
        let query: QueryRequest = {
            "GET": ["courses_dept", "courses_avg"],
            "WHERE" : {},
            "ORDER" : "courses_avg",
            "AS" : "TABLE"
        };
        let dataset: Datasets = {courses: []};
        let controller = new QueryController(dataset);
        let isValid = controller.isValid(query);

        expect(isValid).to.equal(400);
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



});