var gulp = require('gulp');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var minifycss = require('gulp-minify-css');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

process.env.NODE_ENV = 'production';

gulp.task('default',['clean'],function(){
	gulp.start('getcore','css','static');
});

gulp.task('css',function(){
	gulp.src('./client/css/*')
	.pipe(minifycss())
	.pipe(rename({extname:'.min.css'}))
	.pipe(gulp.dest('./public'));
});

gulp.task('static',function(){
	gulp.src(['./client/static/html/*','./client/static/img/*'])
	.pipe(gulp.dest('./public'));
});

gulp.task('clean',function(){
	return gulp.src('./public/*',{read:false})
	.pipe(clean());
});

gulp.task('compile',function(){
	return browserify('./client/app.js')
	.transform(babelify,{presets:['es2015','react'],plugins:['transform-object-assign']})
	.bundle()
	.pipe(source('bundle.js'))
	.pipe(gulp.dest('./public'));
});

gulp.task('getcore',['compile'],function(){
	gulp.src('./public/bundle.js')
	.pipe(uglify())
	.pipe(gulp.dest('./public/'));
});
