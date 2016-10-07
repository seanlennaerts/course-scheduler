/**
 * Created by AnaCris on octubre/6/16.
 */

import Log from "../Util";
import Course from "../model/Course";


export default class MathController{
    private filteredResult: number[];

    constructor(){
        Log.trace('MathController:: init()');
    }

    public greaterThan(courses: Course[], queryKey :string, target :number){
        var filteredCourses = new Array <Course>();

        for(var course: Course in courses){
            if (queryKey == "_dept" || queryKey == "_id" || queryKey == "_title"){
                course.

            }

        }

        switch(queryKey){
            case "avg":


                return;
            case "pass":
                return;
            case "fail":
                return;
            case "audit":
                return;
        }


    }

    smallerThan
    equalTo






}