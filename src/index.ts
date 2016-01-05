'use strict';

import { parse, join, ParsedPath } from 'path';
import { readFile } from 'fs';
import { Readable } from 'stream';
import { create } from 'glob-stream';
import * as File from 'vinyl';

export class JspmAssetStream extends Readable {
    static jspm: IJavascriptPackageManager;

    private package: string = '';
    private glob: string = '';
    private started: boolean = false;
    private fileExt: RegExp = /file:\/\//i;

    private get jspm(): IJavascriptPackageManager {
      if (!JspmAssetStream.jspm) {
        /* tslint:disable:no-require-imports */
        JspmAssetStream.jspm = require('jspm');
        /* tslint:enable:no-require-imports */
      }
      return JspmAssetStream.jspm;
    }

    constructor(options: { package: string, glob: string }) {
        super({ objectMode: true });
        if (!options || ! options.package || ! options.glob) {
          throw new Error('Provide a jspm package name and filepath or glob!');
        }

        this.package = options.package;
        this.glob = options.glob;
    }

    private cleanFilePath(filePath: string): string {
        if (filePath.search(this.fileExt) !== -1) {
            filePath = filePath.substring(6, filePath.length);
        }
        return filePath;
    }

    private resolveDirectory(packageName: string): Promise<string> {
        return this.jspm.normalize(packageName).then((filePath: string) => {
            filePath = this.cleanFilePath(filePath);
            let parsed: ParsedPath = parse(filePath);
            let resolvedPath: string = join(parsed.dir, parsed.name);

            return resolvedPath;
        });
    }

    private readFile(filePath: string): Promise<File> {
      let parsed: ParsedPath = parse(filePath);

      return new Promise((resolve: any, reject: any) => {
        readFile(filePath, (err: Error, data: any) => {
          if (err) {
            reject(err);
          }else {
            let file: File = new File({
              base: parsed.dir,
              contents: data,
              cwd: process.cwd(),
              path: filePath
            });

            resolve(file);
          }
        });
      });
    }

    public _read(): void {
        if (!this.started) {
            this.started = true;

            this.resolveDirectory(this.package)
                .then((filePath: string) => {
                    let globPath: string = join(filePath, this.glob);
                    let stream: NodeJS.ReadableStream = create(globPath);
                    let files: Promise<File>[] = [];

                    stream.on('data', (file: any) => {
                      let promise: Promise<any>;
                      promise = this.readFile(file.path)
                        .then((value: File) => this.push(value))
                        .catch((err: Error) => this.emit('error', err));

                      files.push(promise);
                    });
                    stream.on('end', () => {
                      Promise.all(files).then((value: File[]) => this.push(null));
                    });
                    stream.on('error', (err: Error) => {
                        this.emit('error', err);
                    });
                })
                .catch((error: Error) => {
                    this.emit('error', error);
                });
        }
    }

}

export function jspmAssets(packageName: string, glob: string): JspmAssetStream {
    return new JspmAssetStream({
        glob : glob,
        package: packageName
    });
}

export interface IJavascriptPackageManager {
    normalize(packageName: string): Promise<string>;
}

