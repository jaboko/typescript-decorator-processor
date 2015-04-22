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

gulp.task('examples-ts:build', function (cb) {
    runSequence('examples-ts:compile', cb);
});

gulp.task('examples-ts:watch', function () {

    if (config.paths.source.examples.ts)
        gulp.watch(config.paths.source.examples.ts, ['examples-ts:compile-typescript']);

    if (config.paths.source.examples.noTs)
        gulp.watch(config.paths.source.examples.noTs, ['examples-ts:compile-notypescript']);
});

gulp.task('examples-ts:compile', function (cb) {
    runSequence(
        'examples-ts:compile-typescript',
        'examples-ts:compile-notypescript',
        cb);
});

gulp.task('examples-ts:compile-typescript', function () {
    if (!config.paths.source.examples.ts) return;
    var tsProject = ts.createProject(merge(global.config.typescript.project,
        {
            typescript: require('typescript')
        }));

    var tsResult = gulp.src(config.paths.source.examples.ts)
        .pipe(sourcemaps.init()) //This means sourcemaps will be generated
        .pipe(ts(tsProject));

    tsResult._events.error[0] = function (error) {
        notifier.notify({
            'title': 'Compilation error',
            'message': error.__safety.toString(),
            sound: true
        });
    };

    var defDest = path.join(config.paths.build.examples, 'definitions');
    var jsDest = path.join(config.paths.build.examples, '');

    return merge([
        tsResult.dts
            .pipe(gulp.dest(defDest)),
        tsResult.js
            .pipe(_if(global.config.compress, uglify()))
            .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: path.resolve(config.paths.build.examples)}))
            .pipe(gulp.dest(jsDest)),
    ]);

});

gulp.task('examples-ts:compile-notypescript', function () {
    if (!config.paths.source.examples.noTs) return;
    gulp.src(config.paths.source.examples.noTs)
        .pipe(newer(config.paths.build.examples))
        .pipe(gulp.dest(config.paths.build.examples))
});