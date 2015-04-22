/**
 * Created by jaboko on 12.04.15.
 */
var gulp = require('gulp');

var fs = require('fs');
var getPackageJson = function () {
    return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

gulp.task('version:bump', function (cb) {
    // reget package
    var pkg = getPackageJson();
    // increment version
    var newVer = semver.inc(pkg.version, 'patch');

    // uses gulp-filter
    var manifestFilter = tasks.filter(['manifest.json']);
    var regularJsons = tasks.filter(['!manifest.json']);

    gulp.src('test.js')
        .pipe(prompt.prompt({
            type: 'checkbox',
            name: 'bump',
            message: 'What type of bump would you like to do?',
            choices: ['patch', 'minor', 'major']
        }, function (res) {
            //value is in res.bump (as an array)
        }));

    return gulp.src(['./bower.json', './package.json', './src/manifest.json'])
        .pipe(tasks.bump({
            version: newVer
        }))
        .pipe(manifestFilter)
        .pipe(gulp.dest('./src'))
        .pipe(manifestFilter.restore())
        .pipe(regularJsons)
        .pipe(gulp.dest('./'));
});