/**
 * Created by jaboko on 11.04.15.
 */

'use strict';

var gulp = require('gulp');

var regexFunc = function (rfn) {
    if (rfn && typeof rfn !== "function") {
        return function (t) {
            if (Array.isArray(rfn)) return rfn.indexOf(t) !== -1;
            else return t.search(rfn) !== -1;
        };
    }
    return rfn;
};

module.exports.getTasks = function (searchFilter, excludeFilter) {
    searchFilter = regexFunc(searchFilter);
    excludeFilter = regexFunc(excludeFilter);

    var tasks = Object.keys(gulp.tasks).sort();

    if (searchFilter) {
        tasks = tasks.filter(function (task) {
            return searchFilter(task);
        });
    }

    if (excludeFilter) {
        tasks = tasks.filter(function (task) {
            return !excludeFilter(task);
        });
    }

    return tasks;
};