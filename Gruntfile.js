/* globals module */
/* jshint -W106 */
'use strict';


module.exports = function(grunt) {
    grunt.initConfig({
        mochacli: {
            options: {
                require: ['should'],
                reporter: 'nyan',
                bail: true
            },
            test: {
                src: ['test/**/*.js'],
                options: {
                    reporter: 'nyan'
                }
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'test', // the folder, not the files,
                options: {
                    mask: '*.js',
                    reportFormats: ['html', 'clover']
                }
            }
        },        
        jshint: {
            uses_defaults: {
                src: ['src/**/*.js', 'test/**/*.js']
            },
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            test: {
                files: ['Gruntfile.js', 'test/**/*.js', 'src/**/*.js'],
                tasks: ['test']
            }
        },
        watchify: {
            // options: {
            //     // defaults options used in b.bundle(opts) 
            //     detectGlobals: true,
            //     insertGlobals: false,
            //     ignoreMissing: false,
            //     debug: false,
            //     standalone: false,

            //     keepalive: false,
            //     callback: function (b) {
            //         // configure the browserify instance here 
            //         b.add();
            //         b.require();
            //         b.external();
            //         b.ignore();
            //         b.transform();

            //         // return it 
            //         return b;
            //     }
            // },            
            gameplay: {
                src: ['./src/client/**/*.js', './src/common/**/*.js'],
                dest: 'public/app.js'
            }
        },
        browserify: {
            'public/app.js': ['/src/client/gameplay.js']
        }         
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-watchify');


    grunt.registerTask('test', ['jshint', 'mochacli:test']);
    grunt.registerTask('coverage', ['test', 'mocha_istanbul']);
};
