/**
 * Created by Sean on 10/1/16.
 */

import Section from "./Section";

export default class Course {

    private _dept: string;
    private _id: string;
    private _title: string;
    private _sections: Section[];

    constructor(dept: string, id: string) {
        this._dept = dept;
        this._id = id;
        this._sections = [];
    }


    get dept(): string {
        return this._dept;
    }

    // set dept(value: string) {
    //     this._dept = value;
    // }

    get id(): string {
        return this._id;
    }

    // set id(value: string) {
    //     this._id = value;
    // }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get sections(): Section[] {
        return this._sections;
    }

    // set sections(value: Array) {
    //     this._sections = value;
    // }

    public addSection(sectionToAdd: Section) {
        this._sections.push(sectionToAdd);
    }
}