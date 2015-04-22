//var gulp = require('gulp');
//var tsc = require('gulp-tsc');
//var shell = require('gulp-shell');
//var runseq = require('run-sequence');
//
//var paths = {
//    tscripts: {
//        src: ['app/**/*.ts'],
//        dest: 'build'
//    }
//};
//
//gulp.task('default', ['buildrun']);
//
//// ** Running ** //
//
//gulp.task('buildrun', function (cb) {
//    runseq('build', 'run', cb);
//});
//
//// ** Watching ** //
//
//
//gulp.task('watch', function () {
//    gulp.watch(paths.tscripts.src, ['compile:typescript']);
//});
//
//gulp.task('watchrun', function () {
//    gulp.watch(paths.tscripts.src, runseq('compile:typescript', 'run'));
//});
//
//// ** Compilation ** //
//
//gulp.task('build', ['compile:typescript']);
//gulp.task('compile:typescript', function () {
//    return gulp
//        .src(paths.tscripts.src)
//        .pipe(tsc({
//            target: "es5",
//            module: "commonjs",
//            emitError: false
//        }))
//        .pipe(gulp.dest(paths.tscripts.dest));
//});

/**
 * Created by jaboko on 11.04.15.
 */

'use strict';

require('./gulp.config.js');

var Module = require('module');
var debug = require('debug')('autoinstall');
var execFile = require('child_process').execFileSync;

if (execFile) {
    var resolve = Module._resolveFilename;
    Module._resolveFilename = function (path) {
        try {
            return resolve.apply(Module, arguments)
        } catch (err) {
            if (err.code !== 'MODULE_NOT_FOUND') throw err
        }

        var name = path.split('/')[0];
        debug('downloading package: %s', name);
        execFile('npm', ['install', name, '--save-dev']);

        return resolve.apply(Module, arguments)
    }
}

var requireDir = require('require-dir');
requireDir(__dirname + '/gulp/tasks', {recurse: true});
requireDir(__dirname + '/gulp/utils', {recurse: true});