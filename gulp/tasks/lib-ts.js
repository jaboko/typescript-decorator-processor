/**
 * Created by jaboko on 21.04.15.
 */

var gulp = require('gulp');
var path = require('path');
var runSequence = require('run-sequence');
var ts = require('gulp-typescript');
var concat = require('gulp-concat-sourcemap');
var sourcemaps = require('gulp-sourcemaps');
var merge = require('merge');
var notifier = require('node-notifier');
var jshint = require('gulp-jshint');
var _if = require('gulp-if');
var newer = require('gulp-newer');
var uglify = require('gulp-uglify');

var config = global.config;

gulp.task('lib-ts:build', function (cb) {
    runSequence('lib-ts:compile', cb);
});

gulp.task('lib-ts:watch', function () {
    gulp.watch(config.paths.source.lib.ts, ['lib-ts:compile-typescript']);
    gulp.watch(config.paths.source.lib.noTs, ['lib-ts:compile-notypescript']);
});

gulp.task('lib-ts:compile', function (cb) {
    runSequence(
        'lib-ts:compile-typescript',
        'lib-ts:compile-notypescript',
        cb);
});

gulp.task('lib-ts:compile-typescript', function () {

    var tsProject = ts.createProject(merge(global.config.typescript.project,
        {
            typescript: require('typescript')
        }));

    var tsResult = gulp.src(config.paths.source.lib.ts)
        .pipe(sourcemaps.init()) //This means sourcemaps will be generated
        .pipe(ts(tsProject));

    tsResult._events.error[0] = function (error) {
        notifier.notify({
            'title': 'Compilation error',
            'message': error.__safety.toString(),
            sound: true
        });
    };

    var defDest = path.join(config.paths.build.lib, 'definitions');
    var jsDest = path.join(config.paths.build.lib, '');

    return merge([
        tsResult.dts.pipe(gulp.dest(defDest)),
        tsResult.js
            .pipe(concat('main.js'))
            //.pipe(jshint())
            //.pipe(jshint.reporter('jshint-stylish'))
            .pipe(_if(global.config.compress, uglify()))
            .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: path.resolve(config.paths.build.lib)}))
            .pipe(gulp.dest(jsDest)),
    ]);

});

gulp.task('lib-ts:compile-notypescript', function () {
    gulp.src(config.paths.source.lib.noTs)
        .pipe(newer(config.paths.build.lib))
        .pipe(gulp.dest(config.paths.build.lib))
});