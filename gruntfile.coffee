module.exports = (grunt) ->
  
  group = (args...) -> Array::concat.call(args...)
  
  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')
    
    ts:
      options:
        fast: 'never'
        verbose: true
        compiler: './node_modules/typescript/bin/tsc'
        # additionalFlags: '--traceResolution'
      build:
        tsconfig:
          tsconfig: './tsconfig_build.json'
          passThrough: true
      specs:
        tsconfig:
          tsconfig: './tsconfig_specs.json'
          passThrough: true
      specHelpers:
        tsconfig:
          tsconfig: './tsconfig_specHelpers.json'
          passThrough: true
    
    coffee:
      options: { bare: true }
      build:
        files: [{
          expand: true
          cwd: 'src'
          src: ['**/*.coffee']
          dest: 'tmp/bin-es6/'
          ext: '.js'
        }]
          
      test:
        files: [
          {expand: true, cwd: 'specs', src: ['**/*.coffee'], dest: 'tmp/specs-es6/', ext: '.js'}
          {expand: true, cwd: 'specHelpers', src: ['**/*.coffee'], dest: 'tmp/specHelpers/', ext: '.js'}
        ]
    
    copy:
      build:
        src: 'src/**/*.js'
        dest: 'tmp/bin-es6/'
        
      test:
        files: [
          {expand: true, src: ['specs/**/*.js'], dest: 'tmp/specs-es6/'}
          {expand: true, src: ['specHelpers/**/*.js'], dest: 'tmp/specHelpers/'}
        ]
    
    babel:
      options:
        presets: ['babel-preset-es2015']
        plugins: ['babel-plugin-transform-es2015-modules-amd', 'external-helpers']
      
      build:
        files: [{
          expand: true
          cwd: 'tmp/bin-es6'
          src: ['**/*.js']
          dest: 'bin/'
          ext: '.js'
        }]
      
      test:
        files: [{
          expand: true
          cwd: 'tmp/specs-es6'
          src: ['**/*.js']
          dest: 'tmp/specs/'
          ext: '.js'
        }]
    
    jasmine:
      test:
        options:
          specs: ['tmp/specs/**/*.js']
          vendor: ['lib/babel-helpers.js']
          helpers: ['tmp/specHelpers/**/*.js']
          template: require('grunt-template-jasmine-requirejs')
          templateOptions:
            requireConfig:
              baseUrl: 'bin/'
              deps: ['../node_modules/babel-polyfill/dist/polyfill']
    
    requirejs:
      dist:
        options:
          almond: true
          baseUrl: 'bin/'
          paths:
            'almond': '../node_modules/almond/almond'
          # replaceRequireScript: [module: 'platter/main', modulePath: 'platter/main']
          include: ['../lib/babel-helpers', 'platter/main', '../node_modules/babel-polyfill/dist/polyfill']
          optimize: 'none'
          wrap:
            startFile: 'frags/start.js'
            endFile: 'frags/end.js'
          name: 'almond'
          out: 'tmp/<%= pkg.name %>.js'
    
    uglify:
      options:
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      dist:
        src: 'tmp/<%= pkg.name %>.js'
        dest: 'dist/<%= pkg.name %>.min.js'
    
    clean:
      build: ['bin']
      post: ['tmp']
  
  grunt.loadNpmTasks('grunt-ts')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-contrib-jasmine')
  grunt.loadNpmTasks('grunt-contrib-requirejs')
  grunt.loadNpmTasks('grunt-contrib-uglify')

  buildTasks = [
    'ts:build', 'coffee:build', 'copy:build', 'clean:build', 'babel:build'
  ]
  testTasks = ['ts:specs', 'ts:specHelpers', 'coffee:test', 'copy:test',
    'babel:test', 'jasmine:test'
  ]
  distTasks = ['requirejs:dist', 'uglify:dist']
  cleanTasks = ['clean:post']
  
  grunt.registerTask('build', group(cleanTasks, buildTasks, cleanTasks))
  grunt.registerTask('test', group(cleanTasks, buildTasks, testTasks, cleanTasks))
  grunt.registerTask('dist', group(cleanTasks, buildTasks, testTasks, distTasks, cleanTasks))
