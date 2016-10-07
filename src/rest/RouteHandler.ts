/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import DatasetController from '../controller/DatasetController';
import {Datasets} from '../controller/DatasetController';
import QueryController from '../controller/QueryController';

import {QueryRequest} from "../controller/QueryController";
import Log from '../Util';
import {Route} from "restify";

export default class RouteHandler {

    private static datasetController = new DatasetController();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        fs.readFile('./src/rest/views/index.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
        try {
            var id: string = req.params.id;

            // stream bytes from request into buffer and convert to base64
            // adapted from: https://github.com/restify/node-restify/issues/880#issuecomment-133485821
            let buffer: any = [];
            req.on('data', function onRequestData(chunk: any) {
                Log.trace('RouteHandler::postDataset(..) on data; chunk length: ' + chunk.length);
                buffer.push(chunk);
            });

            req.once('end', function () {
                let concated = Buffer.concat(buffer);
                req.body = concated.toString('base64');
                Log.trace('RouteHandler::postDataset(..) on end; total length: ' + req.body.length);

                let controller = RouteHandler.datasetController;
                controller.process(id, req.body).then(function (result) {
                    Log.trace('RouteHandler::postDataset(..) - processed');
                    if (result === 204) {
                        res.json(result, {success: "ID is new and was added to dataset succesfully!"});
                    } else if (result === 201) {
                        res.json(result, {success: "ID is not new and was added to dataset succesfully!"});
                    } else {
                        res.json(200, {success: result});
                    }
                }).catch(function (err: Error) {
                    Log.trace('RouteHandler::postDataset(..) - ERROR: ' + err.message);
                    res.json(400, {err: err.message});
                });
            });

        } catch (err) {
            Log.error('RouteHandler::postDataset(..) - ERROR: ' + err.message);
            res.send(400, {err: err.message});
        }
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        try {
            let query: QueryRequest = req.params;
            let datasets: Datasets = RouteHandler.datasetController.getDatasets();
            let controller = new QueryController(datasets);
            let isValid = controller.isValid(query);

            if (isValid === true) {
                let result = controller.query(query);
                res.json(200, result);
            } else {
                res.json(400, {status: 'invalid query'});
            }
        } catch (err) {
            Log.error('RouteHandler::postQuery(..) - ERROR: ' + err);
            res.send(403);
        }
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            RouteHandler.datasetController.deleteDataset(req.params.id);
            res.send(204);

        } catch (err) {
            Log.error("deleteDataset(): ERROR " + err);
            res.send(404);
        }
        return next();
    }
}
