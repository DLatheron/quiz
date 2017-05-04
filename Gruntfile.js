/* globals module */
/* jshint -W106 */

module.exports = function(grunt) {
    grunt.initConfig({
        mochacli: {
            options: {
                require: ['should'],
                reporter: 'nyan',
                bail: true
            },
            test: {
                src: ['tests/*.js'],
                options: {
                    reporter: 'nyan'
                }
            }
        },
        jshint: {
            uses_defaults: {
                src: ['src/**/*.js', 'tests/**/*.js']
            },
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            test: {
                files: ['Gruntfile.js', 'tests/**/*.js', 'src/**/*.js'],
                tasks: ['test']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mocha-cli');

    grunt.registerTask('test', ['jshint', 'mochacli:test']);
};
