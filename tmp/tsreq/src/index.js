'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var path_1 = require('path');
var fs_1 = require('fs');
var stream_1 = require('stream');
var glob_stream_1 = require('glob-stream');
var File = require('vinyl');
var JspmAssetStream = (function (_super) {
    __extends(JspmAssetStream, _super);
    function JspmAssetStream(options) {
        _super.call(this, { objectMode: true });
        this.package = '';
        this.glob = '';
        this.started = false;
        this.fileExt = /file:\/\//i;
        this.package = options.package;
        this.glob = options.glob;
    }
    Object.defineProperty(JspmAssetStream.prototype, "jspm", {
        get: function () {
            if (!JspmAssetStream.jspm) {
                /* tslint:disable:no-require-imports */
                JspmAssetStream.jspm = require('jspm');
            }
            return JspmAssetStream.jspm;
        },
        enumerable: true,
        configurable: true
    });
    JspmAssetStream.prototype.cleanFilePath = function (filePath) {
        if (filePath.search(this.fileExt) !== -1) {
            filePath = filePath.substring(6, filePath.length);
        }
        return filePath;
    };
    JspmAssetStream.prototype.resolveDirectory = function (packageName) {
        var _this = this;
        return this.jspm.normalize(packageName).then(function (filePath) {
            filePath = _this.cleanFilePath(filePath);
            var parsed = path_1.parse(filePath);
            var resolvedPath = path_1.join(parsed.dir, parsed.name);
            return resolvedPath;
        });
    };
    JspmAssetStream.prototype.readFile = function (filePath) {
        var parsed = path_1.parse(filePath);
        return new Promise(function (resolve, reject) {
            fs_1.readFile(filePath, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    var file = new File({
                        base: parsed.dir,
                        contents: data,
                        cwd: process.cwd(),
                        path: filePath
                    });
                    resolve(file);
                }
            });
        });
    };
    JspmAssetStream.prototype._read = function () {
        var _this = this;
        if (!this.started) {
            this.started = true;
            this.resolveDirectory(this.package)
                .then(function (filePath) {
                var globPath = path_1.join(filePath, _this.glob);
                var stream = glob_stream_1.create(globPath);
                var files = [];
                stream.on('data', function (file) {
                    var promise;
                    promise = _this.readFile(file.path)
                        .then(function (value) { return _this.push(file); })
                        .catch(function (err) { return _this.emit('error', err); });
                    files.push(promise);
                });
                stream.on('end', function () {
                    Promise.all(files).then(function (value) {
                        _this.push(null);
                        _this.emit('end');
                    });
                });
            })
                .catch(function (error) { return _this.emit('error', error); });
        }
    };
    return JspmAssetStream;
})(stream_1.Readable);
exports.JspmAssetStream = JspmAssetStream;
function jspmAssets(packageName, glob) {
    return new JspmAssetStream({
        glob: glob,
        package: packageName
    });
}
exports.jspmAssets = jspmAssets;
