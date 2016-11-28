/**
 * Created by AnaCris on noviembre/27/16.
 */
import Schedulizer from "../src/controller/SchedulizerController";
import {expect} from 'chai';
import {courseItem} from "../src/controller/SchedulizerController";
import {roomItem} from "../src/controller/SchedulizerController";
import {roomSchedule} from "../src/controller/SchedulizerController";
import {result} from "../src/controller/SchedulizerController";

describe("schedulizerTests", function(){
    let  CPSC110: courseItem = {dept: "CPSC", id: "110", size: 150, sectionsNum: 2};
    let  CPSC210: courseItem = {dept: "CPSC", id: "210", size: 200, sectionsNum: 1};
    let  CPSC213: courseItem = {dept: "CPSC", id: "213", size: 175, sectionsNum: 1};
    let  CPSC221: courseItem = {dept: "CPSC", id: "221", size: 100, sectionsNum: 1};
    let  CPSC310: courseItem = {dept: "CPSC", id: "310", size: 180, sectionsNum: 1};
    let  CPSC313: courseItem = {dept: "CPSC", id: "313", size: 180, sectionsNum: 1};
    let  CPSC320: courseItem = {dept: "CPSC", id: "320", size: 80, sectionsNum: 2};
    let  CPSC666: courseItem = {dept: "CPSC", id: "666", size: 300, sectionsNum: 1};

    let  CPSC999: courseItem = {dept: "CPSC", id: "999", size: 300, sectionsNum: 1};
    let  PHYS110: courseItem = {dept: "PHYS", id: "110", size: 150, sectionsNum: 2};
    let  PHYS210: courseItem = {dept: "PHYS", id: "210", size: 200, sectionsNum: 1};
    let  PHYS213: courseItem = {dept: "PHYS", id: "213", size: 175, sectionsNum: 1};
    let  PHYS221: courseItem = {dept: "PHYS", id: "221", size: 100, sectionsNum: 1};
    let  PHYS310: courseItem = {dept: "PHYS", id: "310", size: 180, sectionsNum: 1};
    let  PHYS313: courseItem = {dept: "PHYS", id: "313", size: 180, sectionsNum: 1};
    let  PHYS320: courseItem = {dept: "PHYS", id: "320", size: 80, sectionsNum: 2};
    let  PHYS444: courseItem = {dept: "PHYS", id: "444", size: 300, sectionsNum: 1};
    let  PHYS666: courseItem = {dept: "PHYS", id: "666", size: 300, sectionsNum: 1};
    let  PHYS999: courseItem = {dept: "PHYS", id: "999", size: 300, sectionsNum: 1};

    let  ECON110: courseItem = {dept: "ECON", id: "110", size: 150, sectionsNum: 2};
    let  ECON210: courseItem = {dept: "ECON", id: "210", size: 200, sectionsNum: 1};
    let  ECON213: courseItem = {dept: "ECON", id: "213", size: 175, sectionsNum: 1};
    let  ECON221: courseItem = {dept: "ECON", id: "221", size: 100, sectionsNum: 1};
    let  ECON310: courseItem = {dept: "ECON", id: "310", size: 180, sectionsNum: 1};

    let courses1: courseItem[] = [];
    let courses2: courseItem[] = [];
    let courses3: courseItem[] = [];

    courses1.push(CPSC110, CPSC210, CPSC213, CPSC221, CPSC310, CPSC313, CPSC320, CPSC666);
    courses2.push(CPSC110, CPSC210, CPSC213, CPSC221, CPSC310, CPSC313, CPSC320, CPSC666,
        CPSC999, PHYS110, PHYS210, PHYS213, PHYS221, PHYS310, PHYS313, PHYS320, PHYS444,
        PHYS666, PHYS999);
    courses3.push(CPSC110, CPSC210, CPSC213, CPSC221, CPSC310, CPSC313, CPSC320, CPSC666,
        CPSC999, PHYS110, PHYS210, PHYS213, PHYS221, PHYS310, PHYS313, PHYS320, PHYS444,
        PHYS666, PHYS999, ECON110, ECON210, ECON213, ECON221, ECON310);

    let DMP101: roomItem = {seats: 250, shortname: "DMP", number: "101"};
    let DMP103: roomItem = {seats: 100, shortname: "DMP", number: "103"};
    let EOSC1101: roomItem = {seats: 200, shortname: "EOSC", number: "1101"};
    let E0SC3012: roomItem = {seats: 250, shortname: "EOSC", number: "3012"};
    let rooms: roomItem[] = []
    let rooms2: roomItem[] = [];
    rooms.push(DMP101, DMP103, EOSC1101, E0SC3012);
    rooms2.push(DMP101);


    beforeEach(function () {
    });

    it("Create sections for courses given their sectionNum", function () {
        let schedulizer: Schedulizer = new Schedulizer();
        let sections = schedulizer.createCourseSections(courses1);

        expect(sections.length).to.equal(10);
    });

    it("sort different courses correctly by seats", function () {

        let schedulizer: Schedulizer = new Schedulizer();
        let sorted = schedulizer.sortDescendingSize(courses3, "course");
        expect(sorted).to.deep.equal(0);

    });

    it("sort courses correctly by seats", function () {

        let schedulizer: Schedulizer = new Schedulizer();
        let sorted = schedulizer.sortDescendingSize(courses1, "course");
        let expectedResult = [
            {dept: "CPSC", id: "666", size: 300, sectionsNum: 1},
            {dept: "CPSC", id: "210", size: 200, sectionsNum: 1},
            {dept: "CPSC", id: "310", size: 180, sectionsNum: 1},
            {dept: "CPSC", id: "313", size: 180, sectionsNum: 1},
            {dept: "CPSC", id: "213", size: 175, sectionsNum: 1},
            {dept: "CPSC", id: "110", size: 150, sectionsNum: 2},
            {dept: "CPSC", id: "221", size: 100, sectionsNum: 1},
            {dept: "CPSC", id: "320", size: 80, sectionsNum: 2}
        ];
        expect(sorted).to.deep.equal(expectedResult);
    });

    it("sort rooms correctly by size", function (){
        let schedulizer: Schedulizer = new Schedulizer();
        let sorted = schedulizer.sortDescendingSize(rooms, "room");
        let expectedResult = [
            {seats: 250, shortname: "DMP", number: "101"},
            {seats: 250, shortname: "EOSC", number: "3012"},
            {seats: 200, shortname: "EOSC", number: "1101"},
            {seats: 100, shortname: "DMP", number: "103"}
        ];
        expect(sorted).to.deep.equal(expectedResult);
    });

    it("adds schedule to roomItem", function () {
        let schedulizer: Schedulizer = new Schedulizer();
        let sorted = schedulizer.sortDescendingSize(rooms, "room");
        let expanded : roomSchedule[] = schedulizer.createRoomWithSchedules(sorted);
        let expectedResult = [
            {seats: 250, roomName: "DMP_101", schedule: [""], quality: [0,0]},
            {seats: 250, roomName: "EOSC_3012", schedule: [""], quality: [0,0]},
            {seats: 200, roomName: "EOSC_1101", schedule: [""], quality: [0,0]},
            {seats: 100, roomName: "DMP_103", schedule: [""], quality: [0,0]}
        ];
        expect(expanded).to.deep.equal(expectedResult);
    });

    it("schedules 10 courses", function () {
        let schedulizer: Schedulizer = new Schedulizer();
        let res = schedulizer.scheduleCourses(courses1, rooms);
        let expectedResult: result = {
            scheduled: [
                {seats: 250, roomName: "DMP_101", schedule: ["CPSC_210", "CPSC_310", "CPSC_313", "CPSC_213", "CPSC_110", "CPSC_110", "CPSC_221", "CPSC_320" ,"CPSC_320"], quality: [0,0,1]},
                {seats: 250, roomName: "EOSC_3012", schedule: [""], quality: [0,0,1]},
                {seats: 200, roomName: "EOSC_1101", schedule: [""], quality: [0,0,1]},
                {seats: 100, roomName: "DMP_103", schedule: [""], quality: [0,0,1]}

            ],
            unscheduled: [{dept: "CPSC", id: "666", size: 300, sectionsNum: 1}]
        };

        expect(res).to.deep.equal(expectedResult);
    });

    it("schedules properly 23 courses", function () {
        let schedulizer: Schedulizer = new Schedulizer();
        let res = schedulizer.scheduleCourses(courses2, rooms);
        let expectedResult: result = {
            scheduled: [
                {seats: 250, roomName: "DMP_101", schedule: ["CPSC_210", "CPSC_310", "CPSC_313", "CPSC_213", "CPSC_110", "CPSC_110", "CPSC_221", "CPSC_320" ,"CPSC_320", "PHYS_210", "PHYS_310", "PHYS_313", "PHYS_213", "PHYS_110", "PHYS_110"], quality: [0,0,1]},
                {seats: 250, roomName: "EOSC_3012", schedule: ["PHYS_221","PHYS_320", "PHYS_320"], quality: [0,0,1]},
                {seats: 200, roomName: "EOSC_1101", schedule: [""], quality: [0,0,1]},
                {seats: 100, roomName: "DMP_103", schedule: [""], quality: [0,0,1]}

            ],
            unscheduled: [
                {dept: "CPSC", id: "999", size: 300, sectionsNum: 1},
                {dept: "CPSC", id: "666", size: 300, sectionsNum: 1},
                {dept: "PHYS", id: "444", size: 300, sectionsNum: 1},
                {dept: "PHYS", id: "666", size: 300, sectionsNum: 1},
                {dept: "PHYS", id: "999", size: 300, sectionsNum: 1}
            ]
        };

        expect(res).to.deep.equal(expectedResult);
    });

    it("has to schedule after hours", function(){
        let schedulizer: Schedulizer = new Schedulizer();
        let res = schedulizer.scheduleCourses(courses3, rooms2);

        expect(res).to.deep.equal(0)
    });





});
