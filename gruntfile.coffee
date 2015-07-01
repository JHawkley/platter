module.exports = (grunt) ->
  
  group = (args...) -> Array::concat.call(args...)
  
  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    
    coffee:
      options: { bare: true }
      
      build:
        files: [{
            expand: true
            cwd: 'platter/src'
            src: ['**/*.coffee']
            dest: 'tmp/lib-es6/'
            ext: '.js'
          }]
          
      test:
        files: [
          {expand: true, cwd: 'platter/specs', src: ['**/*.coffee'], dest: 'tmp/specs-es6/', ext: '.js'}
          {expand: true, cwd: 'platter/specHelpers', src: ['**/*.coffee'], dest: 'tmp/specHelpers/', ext: '.js'}
        ]
    
    copy:
      build:
        src: 'platter/src/**/*.js'
        dest: 'tmp/lib-es6/'
        
      test:
        files: [
          {expand: true, src: ['platter/specs/**/*.js'], dest: 'tmp/specs-es6/'}
          {expand: true, src: ['platter/specHelpers/**/*.js'], dest: 'tmp/specHelpers/'}
        ]
    
    babel:
      options:
        modules: 'amd'
      
      build:
        files: [{
            expand: true
            cwd: 'tmp/lib-es6'
            src: ['**/*.js']
            dest: 'platter/lib/'
            ext: '.js'
          }]
      
      test:
        files: [
          {expand: true, cwd: 'tmp/specs-es6', src: ['**/*.js'], dest: 'tmp/specs/', ext: '.js'}
          {expand: true, cwd: 'tmp/specHelpers-es6', src: ['**/*.js'], dest: 'tmp/specHelpers/', ext: '.js'}
        ]
    
    jshint:
      options:
        undef: true
        expr: true
        eqnull: true
        shadow: true
        multistr: true
        '-W093': true
        force: true
        globals:
          define: true
          require: true
      test:
        files: { src: ['platter/lib/**/*.js'] }
    
    jasmine:
      test:
        options:
          specs: 'tmp/specs/**/*.js'
          helpers: 'tmp/specHelpers/**/*.js'
          template: require('grunt-template-jasmine-requirejs')
          templateOptions:
            requireConfig:
              baseUrl: 'platter/'
              paths: { 'platter': 'lib' }
    
    requirejs:
      dist:
        options:
          almond: true
          baseUrl: 'platter/'
          paths:
            'almond': '../node_modules/almond/almond'
            'platter': 'lib'
          # replaceRequireScript: [module: 'platter/main', modulePath: 'platter/main']
          include: ['platter/main']
          optimize: 'none'
          wrap:
            startFile: 'platter/frags/start.js'
            endFile: 'platter/frags/end.js'
          name: 'almond'
          out: 'tmp/<%= pkg.name %>.js'
    
    uglify:
      options:
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      dist:
        src: 'tmp/<%= pkg.name %>.js'
        dest: 'platter/dist/<%= pkg.name %>.min.js'
    
    clean:
      build: ['platter/lib']
      post: ['tmp']
  
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-requirejs')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  
  
  buildTasks = ['clean:post', 'coffee:build', 'copy:build', 'clean:build', 'babel:build']
  testTasks = ['coffee:test', 'copy:test', 'babel:test', 'jshint:test', 'jasmine:test']
  distTasks = ['requirejs:dist', 'uglify:dist']
  cleanTasks = ['clean:post']
  
  grunt.registerTask('build', group(buildTasks, cleanTasks))
  grunt.registerTask('test', group(buildTasks, testTasks, cleanTasks))
  grunt.registerTask('dist', group(buildTasks, testTasks, distTasks, cleanTasks))