
/**
 * Created by Sean on 10/1/16.
 */

export default class Section {

    private _uniqueId: number;
    private _sectionNumber: string; //we made this up

    private _avg: number;
    private _instructor: string[];
    private _pass: number;
    private _fail: number;
    private _audit: number;


    constructor(uniqueId: number) {
        this._uniqueId = uniqueId;
        this._instructor = [];
    }


    set average(value: number) {
        this._avg = value;
    }

    get uniqueId(): number {
        return this._uniqueId;
    }

    get sectionNumber(): string {
        return this._sectionNumber;
    }

    set sectionNumber(value: string) {
        this._sectionNumber = value;
    }

    get instructor(): string[] {
        return this._instructor;
    }

    set instructor(value: string[]) {
        this._instructor = value;
    }

    get pass(): number {
        return this._pass;
    }

    set pass(value: number) {
        this._pass = value;
    }

    get fail(): number {
        return this._fail;
    }

    set fail(value: number) {
        this._fail = value;
    }

    get audit(): number {
        return this._audit;
    }

    set audit(value: number) {
        this._audit = value;
    }
}