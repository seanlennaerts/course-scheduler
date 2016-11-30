/**
 * Created by AnaCris on noviembre/29/16.
 */
import Log from "../Util";
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
        // Log.info("GoogleController: returnLatLons(...)");
        for (var name of names) {
            for (var room of this.datasets) {
                if (room.getField("shortname") === name) {
                    if (!(namesSoFar.includes(name))){
                        var building: buildingLocation = {
                            lat: <number>room.getField("lat"),
                            lon: <number>room.getField("lon"),
                            name: <string>room.getField("shortname")};
                        // Log.info("This is the room that will get pushed: " + JSON.stringify(building));
                        buildings.push(building);
                        namesSoFar.push(name);
                    }
                }
            }
        }
        return buildings;
    }
}