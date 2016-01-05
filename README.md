# gulp-jspm-assets

[![NPM version][npm-image]][npm-url]

Consume css, images, ... assets from jspm all via a nice stream

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

[npm-url]: https://www.npmjs.com/package/gulp-jspm-assets
[npm-image]: https://badge.fury.io/js/gulp-jspm-assets.svg