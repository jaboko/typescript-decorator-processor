/**
 * Created by jaboko on 11.04.15.
 */

var gulp = require('gulp');
var runSequence = require('run-sequence');
var taskListing = require('gulp-task-listing');
var tasks = require('../utils/tasks');

gulp.task('help', taskListing);

gulp.task('default', ['development']);

gulp.task('build', function (cb) {
    runSequence(
        'clean:all',
        'build:all',
        cb);
});

gulp.task('production', function (cb) {
    global.config.production = true;
    runSequence(
        'build',
        'version:bump',
        cb);
});

gulp.task('development', function (cb) {
    runSequence(
        'build',
        'watch:all',
        cb);
});

gulp.task('clean:all', function (cb) {
    runSequence.apply(this, tasks.getTasks("(^clean:|:clean$)", 'clean:all').concat([cb]));
});

gulp.task('build:all', function (cb) {
    runSequence.apply(this, tasks.getTasks("(^build:|:build$)", 'build:all').concat([cb]));
});

gulp.task('lint:all', function (cb) {
    runSequence.apply(this, tasks.getTasks("(^lint:|:lint$)", 'lint:all').concat([cb]));
});

gulp.task('watch:all', function (cb) {
    runSequence(tasks.getTasks("(^watch:|:watch)", 'watch:all'), cb);
});