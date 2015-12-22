'use strict';

import jspm from 'jspm';

import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';

const fileExt: any = /file:\/\//i;

export class JspmAssetStream extends Readable {

    private package: string = '';
    private glob: string = '';
    private started: boolean = false;

    constructor(options: { package: string, glob: string }) {
        super(options);
        this.package = options.package;
        this.glob = options.glob;
    }

    private cleanFilePath(filePath: string): string {
        if (filePath.search(fileExt) !== -1) {
            filePath = filePath.substring(6, filePath.length);
        }
        return filePath;
    }

    private resolveDirectory(packageName: string): Promise<string> {
        return jspm.normalize(packageName).then((filePath: string) => {
            filePath = this.cleanFilePath(filePath);
            let parsed: path.ParsedPath = path.parse(filePath);
            let resolvedPath: string = path.join(parsed.dir, parsed.name);

            return resolvedPath;
        });
    }

    public _read(): void {
        if (!this.started) {
            this.started = true;

            this.resolveDirectory(this.package)
                .then((filePath: string) => {
                    filePath = path.join(filePath, this.glob);
                    let parsed: path.ParsedPath = path.parse(filePath);
                    fs.readFile(filePath, (err: Error, data: any) => {
                        if (err) {
                            this.emit('error', err);
                        }

                        data.cwd = process.cwd();
                        data.base = parsed.dir;
                        data.path = filePath;

                        Object.defineProperty(data, 'relative', {
                            get: function(): string {
                                if (!this.base) {
                                    throw new Error('No base specified! Can not get relative.');
                                }
                                if (!this.path) {
                                    throw new Error('No path specified! Can not get relative.');
                                }
                                return path.relative(this.base, this.path);
                            },
                            set: function(): void {
                                throw new Error('File.relative is generated from the base and path attributes. Do not modify it.');
                            }
                        });

                        data.isNull = data.isStream = data.isDirectory = function(): boolean { return false; };
                        data.isBuffer = function(): boolean { return true; };
                        data.contents = data;
                        this.push(data);
                        this.push(null);
                    });
                })
                .catch((error: Error) => this.emit('error', error));
        }
    }

}

export default function jspmAssets(packageName: string, glob: string): JspmAssetStream {
    return new JspmAssetStream({
        glob : glob,
        package: packageName
    });
}
