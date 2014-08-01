var gulp = require('gulp');
var karma = require('karma').server;
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');


gulp.task('test', function(done) {
    karma.start({
        frameworks: ['mocha', 'chai', 'commonjs'],
        files: ['src/*.js', 'test/*spec.js'],
        preprocessors: {
            'src/**/*.js': ['commonjs'],
            'test/**/*.spec.js': ['commonjs']
        },
        browsers: ['Firefox'],
        singleRun: true,
        reporters: ['dots']
    }, done);
});

gulp.task('default', ['test'], function () {

    gulp.src('src/*.js')
        .pipe(concat('ex-manipulator.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify()).pipe(rename('ex-manipulator.min.js'))
        .pipe(gulp.dest('dist'));
});