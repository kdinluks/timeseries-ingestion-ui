/**
 * grunt test runs Angular unit tests
 */
module.exports = function(grunt) {
    grunt.registerTask('test', ['default', 'jshint', 'clean:test', 'karma']);
};
