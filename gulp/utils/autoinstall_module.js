/**
 * Created by jaboko on 21.04.15.
 */

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