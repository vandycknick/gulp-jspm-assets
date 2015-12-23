'use strict';

import * as jspm from 'jspm';

import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import File from 'vinyl';

const fileExt: any = /file:\/\//i;

export class JspmAssetStream extends Readable {

    private package: string = '';
    private glob: string = '';
    private started: boolean = false;

    constructor(options: { package: string, glob: string }) {
        super({ objectMode: true });
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
        let file: File;

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

                        file = new File({
                          base: parsed.dir,
                          contents: data,
                          cwd: process.cwd(),
                          path: filePath
                        });

                        this.push(file);
                        this.push(null);
                    });
                })
                .catch((error: Error) => this.emit('error', error));
        }
    }

}

export function jspmAssets(packageName: string, glob: string): JspmAssetStream {
    return new JspmAssetStream({
        glob : glob,
        package: packageName
    });
}

