
/**
 * Created by Sean on 10/1/16.
 */

export default class Section {

    private uniqueId: number;
    private sectionNumber: string; //we made this up

    private average: number;
    private instructor: string[];
    private pass: number;
    private fail: number;
    private audit: number;


    constructor(uniqueId: number) {
        this.uniqueId = uniqueId;
        this.instructor = [];
    }


    set average(value: number) {
        this.average = value;
    }

    get uniqueId(): number {
        return this.uniqueId;
    }

    get sectionNumber(): string {
        return this.sectionNumber;
    }

    set sectionNumber(value: string) {
        this.sectionNumber = value;
    }

    get instructor(): string[] {
        return this.instructor;
    }

    set instructor(value: string[]) {
        this.instructor = value;
    }

    get pass(): number {
        return this.pass;
    }

    set pass(value: number) {
        this.pass = value;
    }

    get fail(): number {
        return this.fail;
    }

    set fail(value: number) {
        this.fail = value;
    }

    get audit(): number {
        return this.audit;
    }

    set audit(value: number) {
        this.audit = value;
    }
}