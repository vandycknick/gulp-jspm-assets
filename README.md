# gulp-jspm-assets

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] 

Consume css, images, ... assets from jspm all via a nice stream

#API

##jspmAssets(packageName, glob)
Returns a new instance of JspmAssetStream

##JspmAssetStream(options)
Constructor creates a new file stream matching files in the requested jspm package

##Options
- packageName: name of an installed jspm package
- glob: glob required to match files in the jspm package folder

#Usage
```js
var gulp = require('gulp');
var jspmAssets = require('gulp-jspm-assets');
var minify = require('gulp-minify');

gulp.task('assets', function() {
    jspmAssets('prism', 'themes/theme.css')
        .pipe(minify())
        .pipe(gulp.dest('dest'));
});

```

Or you can use a glob to match multiple files
```js
var gulp = require('gulp');
var jspmAssets = require('gulp-jspm-assets');

gulp.task('images', function() {
    jspmAssets('prism', 'images/**/*.svg')
        .pipe(gulp.dest('dest'));
});

```

[npm-url]: https://www.npmjs.com/package/gulp-jspm-assets
[npm-image]: https://badge.fury.io/js/gulp-jspm-assets.svg

[travis-url]: https://travis-ci.org/nickvdyck/gulp-jspm-assets
[travis-image]: https://travis-ci.org/nickvdyck/gulp-jspm-assets.svg?branch=master

