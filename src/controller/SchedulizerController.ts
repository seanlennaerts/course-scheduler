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

export default class Schedulizer {

    private cannotSchedule: courseItem[];
    private roomsWithSchedules: roomSchedule[];
    private coursesToSchedule: number;
    private maxNumSeats: number;

    constructor(){
        Log.trace("schedulizer::init()");
        this.cannotSchedule = [];
        this.roomsWithSchedules = [];
        this.coursesToSchedule = 0;
        this.maxNumSeats = 0;
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

    public sortDescendingSize(array: any[], identifier: string): any[] {   // false is decreasing
        switch (identifier) {
            case "course":
                var courseArray: courseItem[] = array;
                courseArray = courseArray.sort(this.dynamicSort("size", false));
               //Log.info("This is how the course array got sorted cambio?:")
                // for(var course of courseArray){
                //     Log.info(JSON.stringify(course));
                // }

                return courseArray;
            case "room":
                var roomArray: roomItem[] = array;
                roomArray = roomArray.sort(this.dynamicSort("seats", false));
                //var max: number = 0;
                // for (var room of roomArray){
                //     Log.info("This is room size: " + room.seats + " of current room: "+ JSON.stringify(room));
                //     if (room.seats > max){
                //         max = room.seats;
                //     }
                // }
                // Log.info("Max number of seats is: " + max);
                // this.maxNumSeats = max;
                return roomArray;
            case "result":
                Log.info("will sort by courseName")
                var scheduleArray: roomSchedule[] = array;
                scheduleArray = scheduleArray.sort(this.dynamicSort("roomName", true));
                return scheduleArray;
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
            //Log.info("Sections for course " + coursesInput[i].dept + coursesInput[i].id + " is: " + sections)
            for (var j = 0; j < sections; j++) {
                Log.info("pushing: " + JSON.stringify(coursesInput[i]));
                expandedCourses.push(coursesInput[i]);
            }
        }
        return expandedCourses;
    }

    public createRoomWithSchedules(rooms: roomItem[]): roomSchedule[] {;
        Log.info("Length of input array: " + rooms.length);
        for (var i = 0; i < rooms.length; i++) {
            var roomwithSchedule: roomSchedule = {roomName: rooms[i].shortname + "_" + rooms[i].number, seats: rooms[i].seats, quality: [0,0,0], schedule: [""]};
            this.roomsWithSchedules.push(roomwithSchedule);
        }
        return this.roomsWithSchedules;
    }
    public filterLargerClasses(courses: courseItem[]): courseItem[] {
        Log.info("maxNumSeats is:" + this.maxNumSeats);
        var noBiggerClasses: courseItem[] = [];
        for (var course of courses) {
            if (course.size > this.maxNumSeats) {
                Log.info("This course is larger than maxNumSeats: " + JSON.stringify(course))
                this.cannotSchedule.push(course);
            } else {
                //Log.info("This course can be scheduled: " + JSON.stringify(course))
                noBiggerClasses.push(course)
            }
        }
        return noBiggerClasses;
    }

    public calculateQuality(roomSchedule: roomSchedule[]): roomSchedule[] {
        for (var i = 0; i < roomSchedule.length; i++) {
            if (!(roomSchedule[i].quality[0] === 0)) {
                roomSchedule[i].quality[2] = (7 - roomSchedule[i].quality[0]) / 7;
            }
            else if (roomSchedule[i].quality[0] === 0 && roomSchedule[i].quality[1] === 0){
                roomSchedule[i].quality[2] = 0;
            }
            else if (roomSchedule[i].quality[0] === 0) {
                roomSchedule[i].quality[2] = 1;
            }
            //Log.info("calculating Quality for: " + JSON.stringify(roomSchedule[i].roomName) + "is: " + roomSchedule[i].quality[2]);
        }
        return roomSchedule;
    }

    public scheduleCourses(courses: courseItem[], rooms: roomItem[]): result {
        // sort rooms, get max seats, and create their schedules
        var allRooms: roomItem[] = this.sortDescendingSize(<any>rooms, "room");
        this.maxNumSeats = allRooms[0].seats;
        var roomsAndSchedules: roomSchedule[] = this.createRoomWithSchedules(allRooms);

        // create extra courses for those with multiple sections, weed out those courses with more students than capacity of biggest room, sort
        var allCourses: courseItem [] = this.createCourseSections(courses);
        var allCoursesThatFit: courseItem[] = this.filterLargerClasses(allCourses);
        var sortedCourseSections: courseItem[] = this.sortDescendingSize(allCoursesThatFit, "course");
        this.coursesToSchedule = sortedCourseSections.length;
        var counter: number = 0;

        Log.info("scheduleCourses:: will begin to schedule")
        for (var i = 0; i < roomsAndSchedules.length && this.coursesToSchedule > 0; i++) {
            for (var j = 0; j < 15 && this.coursesToSchedule > 0; j++, counter++) {
                Log.info("Course to schedule: " + JSON.stringify(sortedCourseSections[counter]));
                var courseName: string = sortedCourseSections[counter].dept + "_" +  sortedCourseSections[counter].id;
                roomsAndSchedules[i].schedule[j] = courseName;
                roomsAndSchedules[i].quality[1]++;
                this.coursesToSchedule--;
            }
            Log.info("scheduleCourses:: Going to the next room to keep scheduling classes");
        }

        //start scheduling courses past 9 - 5pm block
        if (sortedCourseSections.length > roomsAndSchedules.length * 15) {
            Log.info("Starting to schedule after hours");
            for (var n = 0; n < roomsAndSchedules.length && this.coursesToSchedule > 0; n++) {
                for (var p = 15; p < 22 && this.coursesToSchedule > 0; p++, counter++) {
                    Log.info("Course to schedule after hours: " + JSON.stringify(sortedCourseSections[counter]));
                    roomsAndSchedules[n].schedule[p] = sortedCourseSections[counter].dept + "_" + sortedCourseSections[counter].id;
                    roomsAndSchedules[n].quality[1]++;
                    roomsAndSchedules[n].quality[0]++;
                    this.coursesToSchedule--;
                }
            }
            // Courses to be scheduled do not fit number of rooms
            if (sortedCourseSections.length > roomsAndSchedules.length * 22) {
                for (counter; counter < sortedCourseSections.length; counter++) {
                    Log.info("Course that doesn't fit in specified room: " + JSON.stringify(sortedCourseSections[counter]));
                    this.cannotSchedule.push(sortedCourseSections[counter]);
                }
            }
        }
        for (var m = 0; m < roomsAndSchedules.length; m++) {
            this.calculateQuality(roomsAndSchedules);
        }
        //sort results by room name

        var sortedSchedules: roomSchedule[] = this.sortDescendingSize(roomsAndSchedules, "result");
        return {scheduled: sortedSchedules, unscheduled: this.cannotSchedule};
    }
}