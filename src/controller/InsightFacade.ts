/**
 * Created by AnaCris on octubre/14/16.
 */
/*
 * This should be in the same namespace as your controllers
 */

import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import QueryController from "./QueryController";
import {QueryRequest} from "./QueryController";
import DatasetController from "./DatasetController";
import {Datasets} from "./DatasetController";
import Log from "../Util";
import {QueryResponse} from "./QueryController";
import Course from "../model/Course";
import {DistanceRequest, default as DistanceController, DistanceResponse} from "./DistanceController";
import HandleInputForSchedulizer from "./HandleInputForSchedulizer";
import {result, default as Schedulizer} from "./SchedulizerController";
import GoogleController from "./GoogleController";
import {buildingLocation} from "./GoogleController";

export default class InsightFacade implements IInsightFacade {

    private static datasetController: DatasetController = new DatasetController;
    private static handleInputForSchedulizer: HandleInputForSchedulizer = new HandleInputForSchedulizer;
    // private static queryController: QueryController = null;

    constructor() {
        Log.info("InsightFacade::init() ");
        //InsightFacade.datasetController = new DatasetController;
        //let datasets = InsightFacade.datasetController.getDatasets(); // removed this line because it makes PUT 204 impossible to test -S
        //InsightFacade.queryController = new QueryController(datasets);
    }

    public addDataset(id: string, content: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let controller = InsightFacade.datasetController;
            controller.process(id, content).then(function (result: number) {
                Log.trace('InsightFacade::addDataset(..) - processed');
                fulfill({code: result, body: {}});
            }).catch(function (error: Error) {
                Log.trace('InsightFacade::addDataset(..) - ERROR: ' + error.message);
                reject({code: 400, body: {error: error.message}});
            });
        });
    }

    public removeDataset(id: string): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let result = InsightFacade.datasetController.deleteDataset(id);
            switch (result) {
                case 204:
                    fulfill({code: 204, body: {}});
                    break;
                case 404:
                    reject({code: 404, body: {}});
                    break;
                default:
                   //
            }
        });
    }

    public performQuery(query: QueryRequest): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject){
            let datasets: Datasets = InsightFacade.datasetController.getDatasets();
            let controller = new QueryController(datasets);
            let isValid = controller.isValid(query);
            Log.info("InsightFacade :: performQuery(..) - isValid is now:" + isValid);

            switch (isValid) {
                case 200:
                    let result: QueryResponse = controller.query(query);
                    Log.info("Lenght of result array after performing query: " + result.result.length);
                    fulfill({code: 200, body: result});
                    break;
                case 424:
                    reject({code: 424, body: {missing: controller.returnWrongIDs()}});
                    break;
                default:
                    reject({code: 400, body: {error: "Invalid query"}});
            }
        });
    }

    public checkDistance(query: DistanceRequest): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject) {
            try {
                let datasets: Datasets = InsightFacade.datasetController.getDatasets();
                let controller = new DistanceController(datasets);
                let result: DistanceResponse = controller.getBuildingsInRange(query);
                fulfill({code: 200, body: result});
            } catch (err) {
                reject({code: 400, body: {error: "Something went wrong"}});
            }
        })
    }

    public addSchedulizerInput(id: string, input: any): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject) {
            try {
                if (id === "course") {
                    Log.info("calling addSectionsNum()")
                    input = InsightFacade.datasetController.addSectionsNum(input)
                }
                InsightFacade.handleInputForSchedulizer.addInput(id, input);
                fulfill({code: 200, body:{}});
            } catch (err) {
                reject({code: 400, body: {error: "Something went wrong"}});
            }
        })
    }

    public getSchedulizerInput(): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject) {
            try {
                let result = InsightFacade.handleInputForSchedulizer.getInputs();
                fulfill({code: 200, body:{result}});
            } catch (err) {
                reject({code: 424, body: {error: "Please go back and select Courses and Rooms to schedule"}});
            }
        })
    }

    public schedulize(): Promise<InsightResponse>{
        return new Promise(function(fulfill, reject) {
            try {
                var inputs: {} = InsightFacade.handleInputForSchedulizer.getInputs();
                let controller: Schedulizer = new Schedulizer();
                let result: result = controller.scheduleCourses((<any>inputs)["course"], (<any>inputs)["room"]);
                fulfill({code: 200, body:{result}});
            } catch (err) {
                reject({code: 424, body: {error: "Please go back and select Courses and Rooms to schedule"}});
            }
        })
    }

    public returnLatLons(rooms: string[]): Promise<InsightResponse>{
        return new Promise(function (fulfill, reject) {
            try {
                let datasets: Datasets = InsightFacade.datasetController.getDatasets();
                let controller: GoogleController = new GoogleController(datasets["rooms"]);
                let result: buildingLocation[] = controller.returnLatLons(rooms);
                fulfill({code: 200, body: {result}});
            } catch (err) {
                reject({code: 404, body:{error: "Oh no! Something went wrong when fetching latlons of buildings" }});
            }
        })
    }
}