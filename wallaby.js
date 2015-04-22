/**
 * Created by jaboko on 13.04.15.
 */

module.exports = function (w) {

    return {
        files: [
            'lib/**/*.ts',
            'examples/**/*.ts',
        ],

        tests: [
            'test/**/*Spec.ts',
        ],

        env: {
            type: 'node',
            params: {
                runner: '--harmony --harmony_arrow_functions'
            }
        },

        "delays": {
            "edit": 500,
            "run": 150
        },

        "workers": {
            "recycle": true
        },

        bootstrap: function (wallaby) {

            var Module = require('module');
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
                    console.log('downloading package: %s', name);
                    execFile('npm', ['install', name, '--save-dev']);

                    return resolve.apply(Module, arguments)
                }
            }

            var chai = require('chai');

            chai.config.includeStack = true;

            global.AssertionError = chai.AssertionError;
            global.Assertion = chai.Assertion;
            global.assert = chai.assert;
            global.expect = chai.expect;
            global.should = chai.should;

            require.extensions['.ts'] = require.extensions['.js'];
        },

        debug: false
    };
};