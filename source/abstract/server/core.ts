////////////////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)                                                                  //
//                                                                                        //
// Copyright (C) 2016  Chriss Mejía - me@chrissmejia.com - chrissmejia.com                //
//                                                                                        //
// Permission is hereby granted, free of charge, to any person obtaining a copy           //
// of this software and associated documentation files (the "Software"), to deal          //
// in the Software without restriction, including without limitation the rights           //
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell              //
// copies of the Software, and to permit persons to whom the Software is                  //
// furnished to do so, subject to the following conditions:                               //
//                                                                                        //
// The above copyright notice and this permission notice shall be included in all         //
// copies or substantial portions of the Software.                                        //
//                                                                                        //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR             //
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,               //
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE            //
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER                 //
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,          //
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE          //
// SOFTWARE.                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////

import * as app from "../../interfaces/app";
import * as bodyParser from "body-parser"; // Parse incoming request bodies
import * as express from "express";
import * as logger from "morgan";  // Log requests

import Apps from "./apps";
import Batch from "./batch";
import Config from "../../interfaces/config";
import JSFiles from "../../lib/files";
import JSloth from "../../lib/core";
import Log from "./log";

/**
 * Creates and configure an ExpressJS web server.
 *
 * @return express.Application
 */
export default class Core {
    /*** Express instance */
    public express: express.Application;

    /**
     * Stores the app port
     * @default System environment port or 3000
     * Please note: the unary + converts to number
     */
    protected port: number = +process.env.PORT || 3000;

    /*** Default configuration filepath */
    protected configPath: string = "/../../../config.json";

    /*** Configuration object */
    protected config: Config;

    /*** Apps object */
    protected apps: app.App[] = [];

    /*** JSloth library */
    protected jsloth: JSloth;

    /**
     * Load configuration settings
     * Set up JSloth Global Library
     * Load installation
     */
    constructor() {
        // Loading JSloth Files directly to load the config file.
        let jslothFiles = new JSFiles();

        // Creating App
        this.express = express();

        Log.hello();

        // Loading Configuration
        Log.module("Loading configuration");
        jslothFiles.exists(__dirname + this.configPath).then(() => {
            this.config = require(__dirname + this.configPath);
            this.express.set("token", this.config.token); // secret token

            this.install();
        }).catch(err => {
            if (err.code === "ENOENT") {
                Log.error("Configuration file not found");
            } else {
                Log.error("Something went wrong");
            }
            Log.error(err);
        });
    }

    /**
     * Install endpoints
     * Configure and run the Express App instance. 
     * Load middlewares
     */
    protected install(): void {
        let appsModule: Apps;
        // Loading JSloth Global Library
        Log.module("Loading core library");
        this.jsloth = new JSloth(this.config);
        this.express.set("jsloth", this.jsloth);

        // Installing Middlewares
        Log.module("Installing middlewares");
        this.middleware();

        // Installing Apps
        appsModule = new Apps(this.config, this.jsloth, this.express);
        appsModule.install((apps: app.App[]) => {
            this.apps = apps;
            this.start();
        });
    }

    /*** Configure Express middlewares */
    protected middleware(): void {
        // Log hits using morgan
        if (this.jsloth.config.dev) {
            this.express.use(logger("dev"));
        } else {
            this.express.use(logger("combined"));
        }
        // Use body parser so we can get info from POST and/or URL parameters
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    /*** Run the server */
    protected start(): void {
        let appCount = 0; // Number of checked apps so far
        let done = true; // All done

        let now = () => {
            // Everything is installed?
            if (done) {
                try {
                    this.express.listen(this.port);
                    console.log("The magic happens on port " + this.port);
                } catch (e) {
                    Log.error(e);
                }
            }
        };

        this.apps.forEach((app) => {
            if (!app.done) {
                done = false;
            }
            appCount++;
            if (this.apps.length === appCount) {
                now();
            }
        });

    }

}