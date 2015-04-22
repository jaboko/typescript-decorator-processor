/**
 * Created by jaboko on 12.04.15.
 */

var gulp = require('gulp');
var tsd = require('tsd');
var path = require('path');
var fs = require('fs');

var rootDir = global.config.paths.root;
var tsdJson = path.join(rootDir, 'tsd.json');

var tsdApi = tsd.getAPI(tsdJson);

var logger = {
    'log': function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[' + gutil.colors.cyan('gulp-tsd') + ']');
        gutil.log.apply(undefined, args);
    }
};

gulp.task('tsd', function (cb) {
    tsd({
        command: 'reinstall',
        config: tsdJson
    }, cb);
});

gulp.task('tsd:init', function () {
    if (!fs.existsSync(tsdJson))
        tsdApi.select("")
});

gulp.task('tsd:install', ["tsd:init"], function () {
    var query = new tsd.Query();

    var options = new tsd.Options();
    options.resolveDependencies = true;
    options.overwriteFiles = true;
    options.saveBundle = true;

    return tsdApi.readConfig()
        .then(function () {
            return tsdApi.select(query, options);
        })
        .then(function (selection) {
            return tsdApi.install(selection, options);
        })
        .then(function (installResult) {
            var written = Object.keys(installResult.written.dict);
            var removed = Object.keys(installResult.removed.dict);
            var skipped = Object.keys(installResult.skipped.dict);

            written.forEach(function (dts) {
                gutil.log('Definition file written: ' + dts);
            });

            removed.forEach(function (dts) {
                gutil.log('Definition file removed: ' + dts);
            });

            skipped.forEach(function (dts) {
                gutil.log('Definition file skipped: ' + dts);
            });
        });

});

gulp.task('tsd:from-bower', function () {
    var tsdApi = new tsd.getAPI(tsdJson);
    var bower = require(path.join(rootDir, './bower.json'));
});
