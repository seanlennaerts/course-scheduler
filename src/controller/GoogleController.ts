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

    private datasets : Room[] = [];

    constructor(rooms: any[]){
        Log.trace("googleController:: init()");
        this.datasets = <Room[]>rooms;
    }

    public returnLatLons(names: string[]): buildingLocation[] {
        let buildings: buildingLocation[] = [];
        let namesSoFar: string[] = [];
        Log.info("GoogleController: returnLatLons(...)");
         for (var i = 0; i < this.datasets.length; i++) {
            for(var j = 0; j < names.length; j++){
                if (<string>this.datasets[i].getField("shortname") === names[j]) {
                    namesSoFar.push(names[j]);
                    var b: Room = this.datasets[i];
                    var building: buildingLocation = {
                        lat: <number>b.getField("lat"),
                        lon: <number>b.getField("lon"),
                        name: <string>b.getField("shortname")};
                    Log.info("This is the room that will get pushed: " + JSON.stringify(building));
                    if (!(namesSoFar.includes(names[j]))){
                        buildings.push(building);
                    }
                }
            }
        }
        return buildings;
    }
}