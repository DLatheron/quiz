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
            },
            browserify: {
                files: ['src/client/**/*.js', 'src/common/**/*.js'],
                tasks: ['browserify']
            }
        },
        browserify: {
            dist: {
                files: {
                    'public/app.js': ['src/client/gameplay.js']
                }
            }
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
