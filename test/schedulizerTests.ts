/**
 * Created by AnaCris on noviembre/27/16.
 */
import {courseItem, roomItem, roomSchedule, result} from "../src/controller/schedulizer";
import Schedulizer from "../src/controller/schedulizer";
import {expect} from 'chai';

describe("schedulizerTests", function(){
    let  CPSC110: courseItem = {dept: "CPSC", id: "110", size: 150, sectionsNum: 2};
    let  CPSC210: courseItem = {dept: "CPSC", id: "210", size: 200, sectionsNum: 1};
    let  CPSC213: courseItem = {dept: "CPSC", id: "213", size: 175, sectionsNum: 1};
    let  CPSC221: courseItem = {dept: "CPSC", id: "221", size: 100, sectionsNum: 1};
    let  CPSC310: courseItem = {dept: "CPSC", id: "310", size: 180, sectionsNum: 1};
    let  CPSC313: courseItem = {dept: "CPSC", id: "313", size: 180, sectionsNum: 1};
    let  CPSC320: courseItem = {dept: "CPSC", id: "320", size: 80, sectionsNum: 2};
    let  CPSC666: courseItem = {dept: "CPSC", id: "666", size: 300, sectionsNum: 1};
    let courses1: courseItem[] = [];
    let courses2: courseItem[] = [];
    courses1.push(CPSC110, CPSC210, CPSC213, CPSC221, CPSC310, CPSC313, CPSC320, CPSC666);

    let DMP101: roomItem = {seats: 250, shortname: "DMP", number: "101"};
    let DMP103: roomItem = {seats: 100, shortname: "DMP", number: "103"};
    let EOSC1101: roomItem = {seats: 200, shortname: "EOSC", number: "1101"};
    let E0SC3012: roomItem = {seats: 250, shortname: "EOSC", number: "3012"};
    let rooms: roomItem[] = []
    rooms.push(DMP101, DMP103, EOSC1101, E0SC3012);



    beforeEach(function () {
    });

    it("Create sections for courses given their sectionNum", function () {
        let schedulizer: Schedulizer = new Schedulizer();
        let sections = schedulizer.createCourseSections(courses1);

        expect(sections.length).to.equal(10);
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

    it("schedules properly", function () {
        let schedulizer: Schedulizer = new Schedulizer();
        let res = schedulizer.scheduleCourses(courses1, rooms);
        let expectedResult: result = {
            scheduled: [
                {seats: 250, roomName: "DMP_101", schedule: ["CPSC_210"], quality: [0,0]},
                {seats: 250, roomName: "EOSC_3012", schedule: ["CPSC_310"], quality: [0,0]},
                {seats: 200, roomName: "EOSC_1101", schedule: ["CPSC_313"], quality: [0,0]},
                {seats: 100, roomName: "DMP_103", schedule: ["CPSC_213"], quality: [0,0]}

            ],
            unscheduled: [{dept: "CPSC", id: "666", size: 300, sectionsNum: 1}]
        };

    });





});
