module.exports = function(grunt){

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    shell: {
      browserify: {
        // -r externalizes the module as annie
        command: 'browserify -r ./sdk/node/annie.js:annie > ./sdk/browser/annie.js'
      }
    },

    uglify: {
      build: {
        files: {
          'sdk/browser/annie.min.js': 'sdk/browser/annie.js',
          '.tmp/Chart.min.js': 'lib/Chart.js/Chart.js'
        }
      }
    },

    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'lib/Chart.js/',
            src: ['Chart.js', 'Chart.min.js'],
            dest: 'public/js/'
          }
        ]
      }
    },

    watch: {

    }

  });

  grunt.registerTask('default', []);
  grunt.registerTask('build', ['shell:browserify', 'uglify:build', 'copy:build']);
}