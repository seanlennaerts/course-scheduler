/**
 * Created by Sean on 10/1/16.
 */

import Section from "./Section";

export default class Course {

    private dept: string;
    private id: string;
    private title: string;
    private sections: Section[];

    constructor(dept: string, id: string) {
        this.dept = dept;
        this.id = id;
        this.sections = [];
    }


    get dept(): string {
        return this.dept;
    }

    get id(): string {
        return this.id;
    }

    get title(): string {
        return this.title;
    }

    set title(value: string) {
        this.title = value;
    }

    get sections(): Section[] {
        return this.sections;
    }

    public addSection(sectionToAdd: Section) {
        this.sections.push(sectionToAdd);
    }
}