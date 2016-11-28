import {courseItem, roomItem, default as Schedulizer, result} from "./SchedulizerController";
import Log from "../Util";
/**
 * Created by Sean on 11/27/16.
 */

export default class HandleInputForSchedulizer {
    private inputCourses: courseItem[];
    private inputRooms: roomItem[];

    constructor(){
    }

    public addInput(id: string, input: any[]) {
        if (id === "course") {
            Log.info("inputing Courses: " + JSON.stringify(input));
            this.inputCourses = <courseItem[]>input;
        } else {
            Log.info("inputing Rooms: " + JSON.stringify(input));
            this.inputRooms = <roomItem[]>input;
        }
    }

    public getInputs(): {} {
        Log.info("Getting courses: " + JSON.stringify(this.inputCourses));
        Log.info("Getting rooms: " + JSON.stringify(this.inputRooms));
        if (this.inputRooms.length > 0 && this.inputCourses.length > 0) {
            return {"course": this.inputCourses, "room": this.inputRooms};
        } else {
            Log.info("Missing input");
            throw new Error("Missing input");
        }
    }
}