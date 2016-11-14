/**
 * Created by Sean on 11/1/16.
 */

export default class Room {

    //identified by:
    private _uuid: string;

    //room info:
    private _fullname: string;
    private _shortname: string; //from html file
    private _name: string;
    private _number: string;
    private _address: string;
    private _lat: number;
    private _lon: number;
    private _seats: number;
    private _type: string;
    private _furniture: string;
    private _href: string;

    constructor(fullname: string, shortname: string, number: string, name: string,
                address: string, lat: number, lon: number, seats: number, type: string,
                furniture: string, href: string) {
        this._fullname = fullname;
        this._shortname = shortname;
        this._number = number;
        this._name = name;
        this._uuid = name;
        this._address = address;
        this._lat = lat;
        this._lon = lon;
        this._seats = seats;
        this._type = type;
        this._furniture = furniture;
        this._href = href;
    }

    public getUniqueId(): string {
        return this._uuid;
    }

    public getField (field: string): number|string {
        switch (field) {
            case "fullname":
                return this._fullname;
            case "shortname":
                return this._shortname;
            case "number":
                return this._number;
            case"name":
                return this._name;
            case "address":
                return this._address;
            case "lat":
                return this._lat;
            case "lon":
                return this._lon;
            case "seats":
                return this._seats;
            case "type":
                return this._type;
            case "furniture":
                return this._furniture;
            case "href":
                return this._href;
            default:
                //
        }
    }
}