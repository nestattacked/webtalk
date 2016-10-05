var gulp = require('gulp');
var clean = require('gulp-clean');

gulp.task('default',function(){
	console.log('gulp is working!');
});

gulp.task('static',function(){
});

gulp.task('clean',function(){
	gulp.src('public/*',{read:false})
	.pipe(clean());
});
