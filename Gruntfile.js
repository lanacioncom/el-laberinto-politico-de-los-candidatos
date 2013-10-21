module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    version: '<%= grunt.template.today("yyyymmddHHMM") %>',

    env : {
      options : {
      //Shared Options Hash
      },
      dev : {
        NODE_ENV : 'DEVELOPMENT'
      },
      prod : {
        NODE_ENV : 'PRODUCTION'
      }
    },

    copy: {
      no_css_files: {
        files: [
          {expand: true, src: ['css/**', '!css/*.css'], dest: 'build/<%= version %>'}
        ]
      },
      imgs: {
        files: [
          {expand: true, src: ['img/**'], dest: 'build/<%= version %>'}
        ]
      },
      data: {
        files: [
          {expand: true, src: ['data/**'], dest: 'build/<%= version %>'}
        ]
      }
    },

    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> - Minified <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n'
      },
      combine: {
        files: {
          'build/<%= version %>/css/<%= pkg.name %>.min.css': ['css/reset.css', 'css/font.css', 'css/jquery.qtip.min.css', 'css/select2.css', 'css/shadowbox.css', 'css/estilo.css']
        }
      }
    },

    concat: {
      options: {
        banner: '/*! <%= pkg.name %> - Concat <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n'
      },
      libs: {
        files: {
          'build/<%= version %>/js/<%= pkg.name %>.libs.min.js' : [
            'js/libs/d3.min.js',
            'js/libs/queue.v1.min.js',
            'js/libs/jquery-1.10.2.min.js',
            'js/libs/shadowbox.js',
            'js/libs/jquery.easing.1.3.js',
            'js/libs/jquery.qtip.min.js',
            'js/libs/select2.min.js',
            'js/libs/select2_locale_es.js',
            'js/libs/handlebars.js',
            'js/libs/minishare.js'
          ]
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - Uglified <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n'
      },

      code: {
        files: {
          'build/<%= version %>/js/<%= pkg.name %>.code.min.js' : [
            'js/d3.politicos.js',
            'js/main.js'
            ]
          }
      }
    },

    connect: {
      dev : {
        options: {
          port: 8080,
          open:'http://localhost:8080/dev.html'
        }
      },
      prod : {
        options: {
          port: 8080,
          keepalive:true,
          open:'http://localhost:8080/index.html'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },
      tpl: {
        files: ['tpl.html'],
        tasks: ['dev']
      },
    },

    preprocess : {
        dev : {
            src : 'tpl.html',
            dest : 'dev.html',
            options : {
              context : {
                  name : '<%= pkg.name %>',
                  version : '<%= version %>/',
                  versionPath : ''
              }
            }
        },
        bkp : {

            src : 'tpl.html',
            dest : 'index.html',
            options : {
                context : {
                    name : '<%= pkg.name %>',
                    version : '<%= version %>/',
                    versionPath : 'build/<%= version %>/'
                }

            }

        },
        prod : {

            src : 'tpl.html',
            dest : 'index.<%= version %>.html',
            options : {
                context : {
                    name : '<%= pkg.name %>',
                    version : '<%= version %>/',
                    versionPath : 'build/<%= version %>/'
                }

            }

        }

    }



  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('server', ['connect:dev','watch']);
  grunt.registerTask('dev', ['env:dev', 'preprocess:dev']);
  grunt.registerTask('build', ['copy:no_css_files','copy:imgs','copy:data','cssmin','concat:libs','uglify:code','env:prod', 'preprocess:prod','preprocess:bkp','connect:prod']);

};