/**
 * Created by AnaCris on noviembre/29/16.
 */
import Log from "../Util";
import DatasetController from "./DatasetController";
import {Datasets} from "./DatasetController";
import Room from "../model/Room";

export interface buildingLocation{
    lat: number,
    lon: number,
    name: string
}

export default class GoogleController {

    private buildings: buildingLocation[];
    private datasets : Room[] = [];

    constructor(rooms: any[]){
        Log.trace("googleController:: init()");
        this.datasets = <Room[]>rooms;
    }

    public returnLatLons(names: string[]): buildingLocation[] {
         for (var i = 0; i < this.datasets.length; i++) {
             if (<string>this.datasets[i].getField("shortname") === names[i])
                 var b: Room = this.datasets[i];
                 var building: buildingLocation = {lat: <number>b.getField("lat"), lon: <number>b.getField("lon"), name: <string>b.getField("shortname")};
                 this.buildings.push(building);
        }
        return this.buildings;
    }
}