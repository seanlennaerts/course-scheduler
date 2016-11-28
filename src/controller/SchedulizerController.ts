import Log from "../Util";
/**
 * Created by AnaCris on noviembre/25/16.
 */

export interface courseItem {
   // uuid: number;
    dept: string;
    id : string;
    size: number;
    sectionsNum: number;

}

export interface roomItem {
    seats: number;
    shortname: string;
    number: string;
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

export default class Schedulizer {

    private withQuality: roomSchedule[] = [];
    private cannotSchedule: string[] = [];
    private roomsWithSchedules: roomSchedule[] = [];

    constructor(){
        Log.trace("schedulizer::init()")
    }

    public dynamicSort(field: string, reverse: boolean) {   // true = ascending
        var key = function (x: any) {
            return x[field]
        };

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
            return something * [-1, 1][+!!reverse];
            //return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];
        }
    }

    public sortDescendingSize(array: any[], identifier: string): any[] {
        switch (identifier) {
            case "course":
                var courseArray: courseItem[] = array;
                courseArray.sort(this.dynamicSort("size", false));
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
            this.roomsWithSchedules[i] = {seats : 0, roomName: "", quality: [], schedule: []};
            this.roomsWithSchedules[i].roomName = rooms[i].shortname + "_" + rooms[i].number;
            this.roomsWithSchedules[i].seats = rooms[i].seats;
            this.roomsWithSchedules[i].quality[0] = 0;    // initializing quality numerator
            this.roomsWithSchedules[i].quality[1] = 0;    // initializing quality denominator
            this.roomsWithSchedules[i].schedule = [""];
        }
        return this.roomsWithSchedules;
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

    public scheduleCourses(courses: courseItem[], rooms: roomItem[]) {
        var sortedCourseSections: courseItem[] = this.sortDescendingSize(<any>this.createCourseSections(courses), "course");
        var allRooms: roomItem[] = this.sortDescendingSize(<any>rooms, "room");
        var roomsAndSchedules: roomSchedule[] = this.createRoomWithSchedules(allRooms);
        var all: number = 0;


        for (var i = 0; i < roomsAndSchedules.length || i < (sortedCourseSections.length / 15); i++) {
            for (var j = 0; j < 15 || j < sortedCourseSections.length; j, all++) {
                var courseName: string = sortedCourseSections[all].dept + sortedCourseSections[all].id;
                if (sortedCourseSections[all].size > roomsAndSchedules[i].seats){
                    this.cannotSchedule.push(courseName)
                } else {
                    roomsAndSchedules[i].schedule[j] = courseName;
                }
            }
            if (courses.length > ((i + 1) * 15)) {     // go into next room if courses to schedule exceeds this room's 15 empty blocks
                break;
            }
        }

        //start scheduling courses past 9 - 5pm block
        if (sortedCourseSections.length > roomsAndSchedules.length * 15) {
            for (var i = 0; i < roomsAndSchedules.length || i < (sortedCourseSections.length / 7); i, all++) {
                for (var j = 15; j < 22 || j < sortedCourseSections.length; j++) {
                    roomsAndSchedules[i].schedule[j] = sortedCourseSections[all].dept + sortedCourseSections[all].id;
                    roomsAndSchedules[i].quality[0]++;
                }
                if (courses.length > ((i + 1) * 7)) {    // go into next room if courses to schedule exceeds this room's 7 after-hours blocks
                    break;
                }
            }
            // Courses to be scheduled do not fit number of rooms
            if (sortedCourseSections.length > roomsAndSchedules.length * 22) {
                var k = 0;
                for (k, all; all < sortedCourseSections.length; all++)
                    this.cannotSchedule[k] = sortedCourseSections[all].dept + sortedCourseSections[all].id;
            }
        }
        this.withQuality = this.calculateQuality(roomsAndSchedules);
        return {schedule: this.withQuality, unscheduled: this.cannotSchedule};
    }
}