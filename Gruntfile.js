module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        cfg: {
            build: 'build',
            pck: 'package',
            tmp: 'tmp'
        },
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            compass: {
                files: ['style/{,*/}*.{scss,sass}'],
                tasks: ['compass']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    'src/*.html',
                    '<%= cfg.tmp %>/{,*/}*.css',
                    '{<%= cfg.tmp %>,src/{,*/}*.js,test/{,*/}*.js',
                    'assets/image/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            options: {
                port: 8999,
                livereload: 35728,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '<%= cfg.tmp %>',
                        'assets',
                        'src',
                        '.'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        '<%= cfg.tmp %>',
                        'assets',
                        'test',
                        'src',
                        '.'
                    ]
                }
            }
        },
        clean: {
            dev: '<%= cfg.tmp %>',
            make: '<%= cfg.build %>',
            pck: {
                src: ['<%= cfg.pck %>/**', '!<%= cfg.pck %>/desktop/cache/**/*'],
                filter: 'isFile'
            }
        },
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
                }
            }
        },
        compass: {
            options: {
                sassDir: 'style',
                cssDir: '<%= cfg.tmp %>',
                generatedImagesDir: '<%= cfg.tmp %>/image/generated',
                imagesDir: 'assets/image/images',
                javascriptsDir: 'src',
                fontsDir: '<%= cfg.tmp %>/font',
                httpImagesPath: '/image',
                httpGeneratedImagesPath: '/image/generated',
                httpFontsPath: '/font',
                relativeAssets: false
            },
            dev: {
                options: {
                    debugInfo: true
                }
            },
            make: {
                options: {
                    debugInfo: false,
                    generatedImagesDir: '<%= cfg.build %>/source/image/generated'
                }
            }
        },
        copy: {
            dev: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/font-awesome/fonts',
                        dest: '<%= cfg.tmp %>/font/',
                        src: '{,*/}*.*'
                    }
                ]
            },
            make: {
                files: [
                    // Source Assets
                    {
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/font-awesome/fonts',
                        dest: '<%= cfg.build %>/source/font/',
                        src: '{,*/}*.*'
                    },
                    {
                        expand: true,
                        dot: true,
                        cwd: 'assets/cursor',
                        dest: '<%= cfg.build %>/source/cursor/',
                        src: '{,*/}*.*'
                    }
                ]
            },
            pck: {
                files: [
                    // Desktop
                    {
                        expand: true,
                        cwd: '<%= cfg.build %>/source/',
                        dest: '<%= cfg.build %>/desktop/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/desktop/',
                        dest: '<%= cfg.build %>/desktop/',
                        src: ['**']
                    },
                    {
                        expand: true,
                        cwd: 'shell/web/',
                        dest: '<%= cfg.build %>/desktop/',
                        src: ['**']
                    }
                ]
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= cfg.build %>/source'
            },
            html: 'src/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= cfg.build %>/source']
            },
            html: ['<%= cfg.build %>/source/{,*/}*.html'],
            css: ['<%= cfg.build %>/source/{,*/}*.css']
        },
        nodewebkit: {
            options: {
                build_dir: '<%= cfg.pck %>/desktop',
                mac: true,
                win: true,
                linux32: true,
                linux64: true,
                mac_icns: 'assets/icon/icon_app.icns',
                zip: false,
                app_name: '<%= pkg.name %>',
                app_version: '<%= pkg.version %>'
            },
            src: '<%= cfg.build %>/desktop/**/*'
        }
    });

    grunt.registerTask('dev', function (target) {
        grunt.task.run([
            'clean:dev',
            'compass:dev',
            'copy:dev',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('test', function (target) {
        grunt.task.run([
            'clean:dev',
            'compass:dev',
            'copy:dev',
            'connect:test',
            'mocha'
        ]);
    });

    grunt.registerTask('build', function (target) {
        grunt.task.run([
            'clean:make',
            'useminPrepare',
            'compass:make',
            'concat',
            'cssmin',
            'uglify',
            'usemin',
            'copy:make'
        ]);
    });

    grunt.registerTask('pck', function (target) {
        grunt.task.run([
            'test',
            'build',
            'clean:pck',
            'copy:pck',
            'nodewebkit'
        ]);
    });


    // By default we'll run the development task
    grunt.registerTask('default', [
        'dev'
    ]);
};