/**
 * Created by jaboko on 12.04.15.
 */

var gulp = require('gulp');
var fs = require('fs');
var path = require('path');
var prompt = require('gulp-prompt');
var bump = require('gulp-bump');

//gulp.task('tag', ['bump', 'commit'], function () {
//    return gulp.src(paths.versionsToBump)
//        .pipe(filter(paths.version))
//        .pipe(tagVersion()).pipe(git.push('origin', 'master', {
//        args: '--tags'
//    }));
//});
//
//gulp.task('add', function () {
//    return gulp.src(paths.versionsToBump).pipe(git.add());
//});
//
//gulp.task('commit', ['add'], function () {
//    return gulp.src(paths.version).pipe($.prompt.prompt({
//        type: 'input',
//        name: 'commit',
//        message: 'enter a commit msg, eg initial commit'
//    }, function (res) {
//        return gulp.src('.').pipe(git.commit(res.commit));
//    }));
//});

var promptBump = function (callback) {
    var semver = require('semver'),
        pkg = require(path.join(global.config.paths.root, "package.json"));

    return gulp.src('')
        .pipe($.prompt.prompt({
            type: 'list',
            name: 'bump',
            message: 'What type of version bump would you like to do ? (current version is ' + pkg.version + ')',
            choices: [
                'patch (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'patch') + ')',
                'minor (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'minor') + ')',
                'major (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'major') + ')',
                'prerelease (' + pkg.version + ' --> ' + semver.inc(pkg.version, 'prerelease') + ')',
                'none (exit)'
            ]
        }, function (res) {
            var newVer;
            if (res.bump.match(/^patch/)) {
                newVer = 'patch';
            } else if (res.bump.match(/^minor/)) {
                newVer = 'minor';
            } else if (res.bump.match(/^major/)) {
                newVer = 'major';
            } else if (res.bump.match(/^prerelease/)) {
                newVer = 'prerelease';
            }
            if (newVer && typeof callback === 'function') {
                return callback(newVer);
            } else {
                return;
            }
        }));
}

gulp.task('bump', function () {

    return promptBump(function (versionType) {
        return gulp.src(
            [
                path.join(global.config.paths.root, './bower.json'),
                path.join(global.config.paths.root, './package.json')
            ])
            .pipe($.bump({type: versionType}))
            .pipe(gulp.dest(global.config.paths.root))
    });
});
