'use strict';

import { parse, join, ParsedPath } from 'path';
import { readFile } from 'fs';
import { Duplex } from 'stream';
import { create } from 'glob-stream';
import * as File from 'vinyl';
import { smashStreams } from 'smash-streams';
import { Jspm } from './jspm';

export class JspmAssetStream extends Duplex {
    private package: string = '';
    private glob: string = '';
    private started: boolean = false;
    private protocolRE: RegExp = /^file:(?:\/{4}|\/{2})/i;
    private _jspm: Jspm;

    constructor(options: { package: string, glob: string }) {
        super({ objectMode: true });
        if (!options || ! options.package || ! options.glob) {
          throw new Error('Provide a jspm package name and filepath or glob!');
        }

        this._jspm = new Jspm();
        this.package = options.package;
        this.glob = options.glob;
    }

    private cleanFilePath(filePath: string): string {
        return filePath.replace(this.protocolRE, '');
    }

    private resolveDirectory(packageName: string): Promise<string> {
        return this._jspm.normalize(packageName).then((filePath: string) => {
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

    public _write(data: any, enc: string, next: Function): void {
      this.push(data);
      next();
    }

}

export function jspmAssets(packageName: string | IJspmAssetsConfig, glob?: string): JspmAssetStream {
    if (arguments.length === 2 && typeof packageName === 'string') {
      return new JspmAssetStream({
          glob : glob,
          package: packageName
      });
    } else if (arguments.length === 1 && typeof packageName === 'object' && packageName !== null) {
      let jspmAssets: IJspmAssetsConfig = packageName;
      let streams: JspmAssetStream[] = [];
      let keys: string[] = Object.keys(jspmAssets);

      if (keys.length === 0 ) {
        throw new Error('No packages or globs paths are provided in the config object!');
      }else {
        Object.keys(jspmAssets).forEach((asset: string) => {
          streams.push(new JspmAssetStream({ glob: jspmAssets[asset], package: asset }));
        });
        return <any>smashStreams(<any>streams);
      }

    } else {
      throw new Error('Parameters not provided in the correct format!');
    }
}

export interface IJspmAssetsConfig {
   [index: string]: string;
}
