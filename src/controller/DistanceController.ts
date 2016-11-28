import {Datasets} from "./DatasetController";
import Room from "../model/Room";
/**
 * Created by Sean on 11/27/16.
 */


export interface DistanceRequest {
    shortname: string;
    range: number;
}
export interface DistanceResponse {
    shortnames: string[];
}

export default class DistanceController {
    private datasets: Datasets = null;

    constructor(datasets: Datasets) {
        this.datasets = datasets;
    }

    //http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    private checkInRange(range: number, origin: number[], destination: number[]): boolean {
        var p = 0.017453292519943295;    // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((destination[0] - origin[0]) * p)/2 +
            c(origin[0] * p) * c(destination[0] * p) *
            (1 - c((destination[1] - origin[1]) * p))/2;

        var distanceKilometers = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km

        return distanceKilometers * 1000 < range;
    }

    private getLatLonPair(room: Room): number[] {
        var temp: number[] = [];
        temp[0] = <number>room.getField("lat");
        temp[1] = <number>room.getField("lon");
        return temp;
    }

    public getBuildingsInRange(request: DistanceRequest): DistanceResponse {
        var temp: string[] = [];
        var olatlon: number[] = [];
        var prevBuilding: string = "";
        if (request.range > 0) {
            for (var room of this.datasets["rooms"]) {
                if (room.getField("shortname") === request.shortname) {
                    olatlon = this.getLatLonPair(room);
                }
            }
            for (var room of this.datasets["rooms"]) {
                if (room.getField("shortname") != prevBuilding) {
                    prevBuilding = room.getField("shortname");
                    var dlatlon: number[] = this.getLatLonPair(room);
                    if (this.checkInRange(request.range, dlatlon, olatlon)) {
                        temp.push(<string>room.getField("shortname"));
                    }
                }
            }
        } else {
            temp.push(request.shortname);
        }

        return {shortnames: temp};
    }
}