module.exports = function(grunt){

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    shell: {
      sdk: {
        // -r externalizes the module as annie
        command: 'browserify -r ./sdk/node/annie.js:annie > ./sdk/browser/annie.js'
      },
      main: {
        command: 'browserify ./client/js/main.js > ./public/js/main.js'
      },
      css: {
        command: 'lessc ./client/css/style.less > ./public/css/style.css'
      }
    },

    peg: {
      build: {
        src: 'core/parser/parser.pegjs',
        dest: 'core/parser/index.js'
      }
    },

    uglify: {
      build: {
        options: {
          mangle: false
        },
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
          },
          {
            expand: true,
            cwd: 'lib/prismjs/',
            src: ['prism.js'],
            dest: 'public/js/'
          },
          {
            expand: true,
            cwd: 'lib/prismjs/',
            src: ['prism.css'],
            dest: 'public/css/'
          }
          // {
          //   expand: true,
          //   cwd: 'client/js/',
          //   src: ['main.js'],
          //   dest: 'public/js/'
          // }
        ]
      }
    },

    watch: {
      parser: {
        options: {
          livereload: true
        },
        files: ['core/parser/parser.pegjs'],
        tasks: ['peg:build']
      },
      js: {
        options: {
          livereload: true
        },
        files: ['client/js/*.js', 'sdk/**/*.js'],
        tasks: ['build']
      },
      less: {
        options: {
          livereload: true
        },
        files: ['client/css/*.less'],
        tasks: ['shell:css']
      },
      html: {
        options: {
          livereload: true
        },
        files: ['views/**/*']
      }
    }

  });

  grunt.registerTask('default', []);
  grunt.registerTask('build', ['peg:build', 'shell', 'uglify:build', 'copy:build']);
}