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
    quality?: number[];   //quality[0] = # of classes outside 9 -5 pm block, quality[1] = # of courses scheduled, quality[2] = quality number
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

    private dynamicSortThree(field: string, reverse: boolean){
        var key = function (x: any) {return x[field]};

        return function (a: any, b: any) {
            var result: number = 0;
            var A = key(a), B = key(b);
            if (A === B) {
                result = a.index - b.index;
            } else if (A < B) {
                result = -1;
            } else {
                result = 1;
            }
            result = result * [-1,1][+!!reverse];
            return result;
            //return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];
        }
    }

    public sortDescendingSize(array: any[], identifier: string): any[] {
        switch (identifier) {
            case "course":
                var courseArray: courseItem[] = array;
                for (var j = 0; j < courseArray.length; j++){
                    courseArray[j]["index"] = j;
                }
                courseArray.sort(this.dynamicSortThree("size", false))

                for (var object of courseArray) {
                    delete object["index"];
                }

                return courseArray;
            case "room":
                var roomArray: roomItem[] = array;
                for (var k = 0; k < roomArray.length; k++){
                    roomArray[k]["index"] = k;
                }
                roomArray.sort(this.dynamicSortThree("seats", false));

                for (var o of roomArray) {
                    delete o["index"];
                }
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
            var roomwithSchedule: roomSchedule = {roomName: rooms[i].shortname + "_" + rooms[i].number, seats: rooms[i].seats, quality: [0,0], schedule: [""]};
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
            if (roomSchedule[i].quality[0] === 0 && roomSchedule[i].quality[1] === 0) {
                roomSchedule[i].quality[2] = 1;
            } else {
                roomSchedule[i].quality[2] = roomSchedule[i].quality[0] / roomSchedule[i].quality[1];
            }
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
                this.numberOfCourses--;
            }
            // if (courses.length > ((i + 1) * 15)) {     // go into next room if courses to schedule exceeds this room's 15 empty blocks
            //     Log.info("scheduleCourses:: Going to the next room to keep scheduling clases");
            //     break;
            // }
            Log.info("scheduleCourses:: Going to the next room to keep scheduling classes");
        }

        //start scheduling courses past 9 - 5pm block
        if (sortedCourseSections.length > roomsAndSchedules.length * 15) {
            for (var i = 0; i < roomsAndSchedules.length || i < (sortedCourseSections.length / 7); i, all++) {
                for (var j = 15; j < 22 && this.numberOfCourses > 0; j++) {
                    roomsAndSchedules[i].schedule[j] = sortedCourseSections[all].dept + sortedCourseSections[all].id;
                    roomsAndSchedules[i].quality[0]++;
                    this.numberOfCourses--;
                }
                if (courses.length > ((i + 1) * 7)) {    // go into next room if courses to schedule exceeds this room's 7 after-hours blocks
                    break;
                }
            }
            // Courses to be scheduled do not fit number of rooms
            if (sortedCourseSections.length > roomsAndSchedules.length * 22) {
                for (all; all < sortedCourseSections.length; all++)
                    this.cannotSchedule.push(sortedCourseSections[all]);
            }
        }
        this.withQuality = this.calculateQuality(roomsAndSchedules);

        return {scheduled: this.withQuality, unscheduled: this.cannotSchedule};
    }

    //for sean

    //
}