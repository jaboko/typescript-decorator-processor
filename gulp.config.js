/**
 * Created by jaboko on 22.04.15.
 */

var path = require('path');

var config = {

    typescript: {
        project: {
            removeComments: true,
            declarationFiles: true,
            noExternalResolve: false,
            sortOutput: true,
            module: 'commonjs',
            target: 'es5',
            noEmitOnError: false
        }
    },

    paths: {
        root: __dirname,

        lint: [
            path.join(__dirname, './build/**/*.js')
        ],

        source: {
            lib: {
                ts: [path.join(__dirname, 'lib/**/*.ts'),
                    path.join(__dirname, 'typings/**/*.ts')
                ],
                noTs: []
            },
            examples :{
                ts: [path.join(__dirname, 'examples/**/*.ts'),
                    path.join(__dirname, 'typings/**/*.ts')
                ]
            }
        },

        watch: [
            path.join(__dirname, './gulp.config.js'),
            path.join(__dirname, './gulpfile.js'),
            path.join(__dirname, './build/**'),
            path.join(__dirname, './test/**/*.js'),
            path.join(__dirname, '!test/{temp,temp/**}'),
        ],

        tests: [
            path.join(__dirname, './test/**/*.js'),
            path.join(__dirname, '!test/{temp,temp/**}')
        ],

        //nonTsServerSources: [
        //    path.join(__dirname, 'app/server/*.{js,json,jsx}')
        //],
        //nonTsClientSources: [
        //    path.join(__dirname, 'app/client/*.{js,json,jsx}')
        //],

        build: {
            lib: path.join(__dirname, 'build', 'lib'),
            examples: path.join(__dirname, 'build', 'examples')
        }
    },

    production: false
};

module.exports = global.config = config;