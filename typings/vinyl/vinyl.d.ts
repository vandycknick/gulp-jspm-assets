// Type definitions for vinyl 0.4.3
// Project: https://github.com/wearefractal/vinyl
// Definitions by: vvakame <https://github.com/vvakame/>, jedmao <https://github.com/jedmao>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../node/node.d.ts" />

declare module 'vinyl' {
	import * as fs from 'fs';

	/**
	 * A virtual file format.
	 */
	interface File {
		new(options?: {
			/**
			* Default: process.cwd()
			*/
			cwd?: string;
			/**
			 * Used for relative pathing. Typically where a glob starts.
			 */
			base?: string;
			/**
			 * Full path to the file.
			 */
			path?: string;
			/**
			 * Path history. Has no effect if options.path is passed.
			 */
			history?: string[];
			/**
			 * The result of an fs.stat call. See fs.Stats for more information.
			 */
			stat?: fs.Stats;
			/**
			 * File contents.
			 * Type: Buffer, Stream, or null
			 */
			contents?: Buffer | NodeJS.ReadWriteStream;
		});

		/**
		 * Default: process.cwd()
		 */
		cwd: string;
		/**
		 * Used for relative pathing. Typically where a glob starts.
		 */
		base: string;
		/**
		 * Full path to the file.
		 */
		path: string;
		stat: fs.Stats;
		/**
		 * Type: Buffer|Stream|null (Default: null)
		 */
		contents: Buffer | NodeJS.ReadableStream;
		/**
		 * Returns path.relative for the file base and file path.
		 * Example:
		 *  var file = new File({
		 *    cwd: "/",
		 *    base: "/test/",
		 *    path: "/test/file.js"
		 *  });
		 *  console.log(file.relative); // file.js
		 */
		relative: string;

		isBuffer(): boolean;

		isStream(): boolean;

		isNull(): boolean;

		isDirectory(): boolean;

		/**
		 * Returns a new File object with all attributes cloned. Custom attributes are deep-cloned.
		 */
		clone(opts?: { contents?: boolean }): File;

		/**
		 * If file.contents is a Buffer, it will write it to the stream.
		 * If file.contents is a Stream, it will pipe it to the stream.
		 * If file.contents is null, it will do nothing.
		 */
		pipe<T extends NodeJS.ReadWriteStream>(
			stream: T,
			opts?: {
				/**
				 * If false, the destination stream will not be ended (same as node core).
				 */
				end?: boolean;
			}): T;

		/**
		 * Returns a pretty String interpretation of the File. Useful for console.log.
		 */
		inspect(): string;
	}
    
    var file: File;

    export = file;

}
