import Log from "../Util";
/**
 * Created by AnaCris on noviembre/25/16.
 */

export interface courseItem {
    dept: string;
    id : string;
    size: number;
    sectionsNum: number;
    index?: number;

}

export interface roomItem {
    seats: number;
    shortname: string;
    number: string;
    index?: number;
}

export interface roomSchedule {
    seats: number;
    roomName: string;
    schedule: string[];
    quality: number[];   //quality[0] = # of classes outside 9 -5 pm block, quality[1] = # of courses scheduled, quality[2] = quality number
}

export interface result{
    scheduled: roomSchedule[];
    unscheduled: courseItem[];
}

//for sean

//

export default class Schedulizer {

    //for sean

    //
    private withQuality: roomSchedule[];
    private cannotSchedule: courseItem[];
    private roomsWithSchedules: roomSchedule[];
    private numberOfCourses: number;

    constructor(){
        Log.trace("schedulizer::init()");
        this.withQuality = [];
        this.cannotSchedule = [];
        this.roomsWithSchedules = [];
        this.numberOfCourses = 0;
    }

    private dynamicSort(field: string, reverse: boolean){
        var key = function (x: any) {return x[field]};

        return function (a: any, b: any) {
            var something: number = 0;
            var A = key(a), B = key(b);
            if (A === B) {
                something = 0;
            } else if (A < B) {
                something = -1;
            } else {
                something = 1;
            }
            return something * [-1,1][+!!reverse];
            //return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];
        }
    }

    public sortDescendingSize(array: any[], identifier: string): any[] {
        switch (identifier) {
            case "course":
                var courseArray: courseItem[] = array;
                courseArray.sort(this.dynamicSort("size", false))
                return courseArray;
            case "room":
                var roomArray: roomItem[] = array;
                roomArray.sort(this.dynamicSort("seats", false));
                return roomArray;
            default:
                Log.info("wrong identifier in parameter")
        }
    }

    public createCourseSections(coursesInput: courseItem[]): courseItem[] {
        Log.info("Schedulizer:: init createCourseSections(...) ")
        var expandedCourses: courseItem[] = [];
        Log.info("Length of course array is: " + coursesInput.length);
        for (var i = 0; i < coursesInput.length; i++) {
            var sections: number = coursesInput[i].sectionsNum;
            Log.info("Sections for course " + coursesInput[i].dept + coursesInput[i].id + " is: " + sections)
            for (var j = 0; j < sections; j++) {
                Log.info("pushing: " + JSON.stringify(coursesInput[i]));
                expandedCourses.push(coursesInput[i]);
            }
        }
        return expandedCourses;
    }

    public createRoomWithSchedules(rooms: roomItem[]): roomSchedule[] {
        Log.info("Length of input array: " + rooms.length);
        for (var i = 0; i < rooms.length; i++) {
            var roomwithSchedule: roomSchedule = {roomName: rooms[i].shortname + "_" + rooms[i].number, seats: rooms[i].seats, quality: [0,0,0], schedule: [""]};
            this.roomsWithSchedules.push(roomwithSchedule);
        }
        return this.roomsWithSchedules;
    }
    public filterLargerClasses(courses: courseItem[], maxSeats: number): courseItem[] {
        var noBiggerClasses: courseItem[] = [];
        for (var course of courses) {
            if (course.size > maxSeats) {
                this.cannotSchedule.push(course);
            } else {
                noBiggerClasses.push(course)
            }
        }
        return noBiggerClasses;
    }

    public calculateQuality(roomSchedule: roomSchedule[]): roomSchedule[] {
        for (var i = 0; i < roomSchedule.length; i++) {
            if (roomSchedule[i].quality[0] === 0 && roomSchedule[i].quality[1] === 0){
                roomSchedule[i].quality[2] = 0;
            }
            else if (roomSchedule[i].quality[0] === 0) {
                roomSchedule[i].quality[2] = 1;
            } else {
                roomSchedule[i].quality[2] = roomSchedule[i].quality[0] / roomSchedule[i].quality[1];
            }
            Log.info("calculating Quality for: " + JSON.stringify(roomSchedule[i].roomName) + "is: " + roomSchedule[i].quality[2]);
        }
        return roomSchedule;
    }

    public scheduleCourses(courses: courseItem[], rooms: roomItem[]): result {
        var unsortedCourses: courseItem [] = this.createCourseSections(courses);
        var allSortedCourseSections: courseItem[] = this.sortDescendingSize(unsortedCourses, "course");
        var allRooms: roomItem[] = this.sortDescendingSize(<any>rooms, "room");
        var roomsAndSchedules: roomSchedule[] = this.createRoomWithSchedules(allRooms);
        var maxNumSeats: number = allRooms[0].seats;
        var all: number = 0;
        var sortedCourseSections: courseItem[] = this.filterLargerClasses(allSortedCourseSections, maxNumSeats);
        this.numberOfCourses = sortedCourseSections.length;

        Log.info("scheduleCourses:: will begin to schedule")
        for (var i = 0; i < roomsAndSchedules.length && this.numberOfCourses > 0; i++) {
            for (var j = 0; j < 15 && this.numberOfCourses > 0; j++, all++) {
                Log.info("Course to schedule: " + JSON.stringify(sortedCourseSections[all]));
                var courseName: string = sortedCourseSections[all].dept + "_" +  sortedCourseSections[all].id;
                roomsAndSchedules[i].schedule[j] = courseName;
                roomsAndSchedules[i].quality[1]++;
                this.numberOfCourses--;
            }
            Log.info("scheduleCourses:: Going to the next room to keep scheduling classes");
        }

        //start scheduling courses past 9 - 5pm block
        if (sortedCourseSections.length > roomsAndSchedules.length * 15) {
            Log.info("Starting to schedule after hours");
            for (var n = 0; n < roomsAndSchedules.length && this.numberOfCourses > 0; n++) {
                for (var p = 15; p < 22 && this.numberOfCourses > 0; p++, all++) {
                    Log.info("Course to schedule after hours: " + JSON.stringify(sortedCourseSections[all]));
                    roomsAndSchedules[n].schedule[p] = sortedCourseSections[all].dept + "_" + sortedCourseSections[all].id;
                    roomsAndSchedules[n].quality[1]++;
                    roomsAndSchedules[n].quality[0]++;
                    this.numberOfCourses--;
                }
            }
            // Courses to be scheduled do not fit number of rooms
            if (sortedCourseSections.length > roomsAndSchedules.length * 22) {
                for (all; all < sortedCourseSections.length; all++) {
                    Log.info("Course that doesn't fit in specified room: " + JSON.stringify(sortedCourseSections[all]));
                    this.cannotSchedule.push(sortedCourseSections[all]);
                }
            }
        }
        for (var m = 0; m < roomsAndSchedules.length; m++) {
            this.calculateQuality(roomsAndSchedules);
        }
        return {scheduled: roomsAndSchedules, unscheduled: this.cannotSchedule};
    }

    //for sean

    //
}