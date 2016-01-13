# gulp-jspm-assets

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][dep-image]][dep-url]

Consume css, images, ... assets from jspm all via a nice stream

##API

###jspmAssets(packageName, glob)
Returns a new instance of JspmAssetStream

###jspmAssets(config)
Returns a merged stream of all the assets in the config object
Config object:
```json
{
  "foundation": "path/**/*.asset",
  "bootstrap": "path/**/*.asset"
}
```

###JspmAssetStream(options)
Constructor creates a new file stream matching files in the requested jspm package

###Options
- packageName: name of an installed jspm package
- glob: glob required to match files in the jspm package folder

##Usage
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

Use a config object to get assets from multiple jspm packages
```js
var gulp = require('gulp');
var jspmAssets = require('gulp-jspm-assets');

gulp.task('sass', function() {
    jspmAssets({
      'bootstrap', 'sass/**/*.scss',
      'foundation', 'sass/**/*.scss'  
    })
    .pipe(watheverTask())
    .pipe(gulp.dest('dest'));
});
```

Or pipe a stream to it to append jspm package assets to it
```js
var gulp = require('gulp');
var jspmAssets = require('gulp-jspm-assets');

gulp.task('css', function() {
    gulp.src('app/**/*.css')
      .pipe(jspmAssets('prism', 'css/**/*.css'))
      .pipe(watheverTask())
      .pipe(concat('./build.css'))
      .pipe(gulp.dest('dest'));
});
```

[npm-url]: https://www.npmjs.com/package/gulp-jspm-assets
[npm-image]: https://badge.fury.io/js/gulp-jspm-assets.svg

[travis-url]: https://travis-ci.org/nickvdyck/gulp-jspm-assets
[travis-image]: https://travis-ci.org/nickvdyck/gulp-jspm-assets.svg?branch=master

[dep-url]: https://david-dm.org/nickvdyck/gulp-jspm-assets
[dep-image]: https://david-dm.org/nickvdyck/gulp-jspm-assets.svg 

