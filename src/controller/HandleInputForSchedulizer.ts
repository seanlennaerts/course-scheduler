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
            this.inputCourses = <courseItem[]>input;
        } else {
            this.inputRooms = <roomItem[]>input;
        }
    }

    public getInputs(): {} {

        if (this.inputRooms.length > 0 && this.inputCourses.length > 0) {
            return {"course": this.inputCourses, "room": this.inputRooms};
        } else {
            throw new Error("Missing input");
        }
    }
}