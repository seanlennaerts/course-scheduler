/**
 * Created by rtholmes on 2016-06-14.
 */
import restify = require('restify');
import fs = require('fs');

import {QueryRequest, QueryResponse} from "../controller/QueryController";
import Log from '../Util';
import InsightFacade from "../controller/InsightFacade";
import {InsightResponse} from "../controller/IInsightFacade";
import {Route} from "restify";

export default class RouteHandler {

    private static insightFacade = new InsightFacade();

    public static getHomepage(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RoutHandler::getHomepage(..)');
        var content = new Buffer(fs.readFileSync('./full-datasets/courses.zip')).toString('base64');
        RouteHandler.insightFacade.addDataset("courses", content).then(function (result) {
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
        }).catch (function(error) {
            //
        });
    }

    public static getRoomExplorer(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::getScheduler(..) - params: ' + JSON.stringify(req.params));
        //    try{
        fs.readFile('./src/rest/views/roomExplorer.html', 'utf8', function (err: Error, file: Buffer) {
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

    public static getSchedulizer(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::getScheduler(..) - params: ' + JSON.stringify(req.params));
    //    try{
        fs.readFile('./src/rest/views/schedulizer.html', 'utf8', function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    //}
      //  catch(err) {
      //      Log.info("Failed to get Schedulizer")
      //  }
    }

    public static  putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postDataset(..) - params: ' + JSON.stringify(req.params));
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

            RouteHandler.insightFacade.addDataset(req.params.id, req.body).then(function(result){
                res.json(result.code, result.body);
            }).catch (function(error) {
                res.json(error.code, error.body);
            });
        });
        return next();
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('RouteHandler::postQuery(..) - params: ' + JSON.stringify(req.params));
        let query: QueryRequest = req.params;
        RouteHandler.insightFacade.performQuery(query).then(function(result: InsightResponse){
            var resultArray = (<QueryResponse>result.body)["result"].filter(function (objRow) {
                return (<any>objRow)["year"] > 1990;
            });
            res.json(result.code, result.body);
        }).catch (function(error) {
            res.json(error.code, error.body);
        });
        return next();
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        RouteHandler.insightFacade.removeDataset(req.params.id).then(function(result){
            res.json(result.code, result.body);
        }).catch (function (error) {
            res.json(error.code, error.body);
        });

        //catch res.send(403)
        return next();
    }
}
