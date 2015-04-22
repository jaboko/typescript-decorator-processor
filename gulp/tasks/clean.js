/**
 * Created by jaboko on 11.04.15.
 */

var gulp = require('gulp');
var del = require('del');

gulp.task('clean:development', function (cb) {
    del(['build/*','build/*.*'], cb)
});

gulp.task('clean:production', function (cb) {
    del(['release/*','release/*.*'], cb)
});