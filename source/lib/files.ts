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

import Config from "../interfaces/Config";
import { Promise } from "es6-promise";

import * as fs from "fs";

/**
 * JSloth Files
 * File related functions.
 */
export default class JSFiles {

    /*** Configuration methods */
    constructor(config?: Config) {
    }

    /**
     * Check if file exists.
     *
     * @param path {string} The specific path.
     * @return Promise<boolean>
     */
    public exists(path: string): Promise<boolean> {
        // Create promise
        const p: Promise<boolean> = new Promise(
            (resolve: (exists: boolean) => void, reject: (err: NodeJS.ErrnoException) => void) => {
                // Resolve promise
                fs.access(path, fs.constants.F_OK, (err) => {
                    if (!err) {
                        resolve(true);
                    } else {
                        reject(err);
                    }
                });
            }
        );
        return p;
    };
}