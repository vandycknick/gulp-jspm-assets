# gulp-jspm-assets
Consume css, images, ... assets from jspm all via a nice stream

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