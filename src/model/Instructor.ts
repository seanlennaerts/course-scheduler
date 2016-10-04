/**
 * Created by Sean on 10/3/16.
 */
import Section from "./Section";

export default class Instructor {

    private _first: string;
    private _last: string;
    private teaches: Section[];


    constructor(first: string, last: string) {
        this._first = first;
        this._last = last;
        this.teaches = [];
    }

    get first(): string {
        return this._first;
    }

    set first(value: string) {
        this._first = value;
    }

    get last(): string {
        return this._last;
    }

    set last(value: string) {
        this._last = value;
    }

    public addSection(sectionToAdd: Section) {
        this.teaches.push(sectionToAdd);
    }
}