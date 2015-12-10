module.exports = function(grunt) {
    //project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //Config

        // JS TASKS ================================================================
        // check all js files for errors
        jshint: {
            all: ['public/js/**/*.js'] 
        },
        
        // take all the js files and minify them into app.min.js
        uglify: {
            build: {
                files: {
                    'public/js/app.min.js': ['javascript/**/*.js', 'javascript/*.js']
                }
            }
        },

        // CSS TASKS ===============================================================
        // process the less file to style.css
        less: {
            build: {
                files: {
                    'public/css/style.css': ['less/**/*.less', 'less/*.less']
                }
            }
        },

        // take the processed style.css file and minify
        cssmin: {
            build: {
                files: {
                    'public/css/style.min.css': 'public/css/style.css'
                }
            }
        },


        // watch css and js files and process the above tasks
        watch: {
            css: {
                files: ['less/**/*.less'],
                tasks: ['less', 'cssmin']
            },
            js: {
                files: ['javascript/**/*.js'],
                tasks: ['jshint', 'uglify']
            }
        },

        // watch our node server for changes
        nodemon: {
            dev: {
                script: 'server.js',
                option: {
                    args: ['dev'],
                    nodeArgs: ['--debug'],
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });
                    },
                    env: {
                        PORT: '3000'
                    },
                    cwd: __dirname,
                    ignore: ['node_modules/**'],
                    ext: 'js,coffee',
                    watch: ['server'],
                    delay: 1000,
                    legacyWatch: true
                }

            }
        },

        // run watch and nodemon at the same time
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            tasks: ['nodemon', 'watch']
        }   

    });

    //dependent plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
 
    //tasks
    grunt.registerTask('default', ['less', 'cssmin', 'jshint', 'uglify', 'concurrent']);
}
