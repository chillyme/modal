var gulp = require("gulp");
var mincss = require("gulp-minify-css");
var minjs = require("gulp-uglify");
var minimage = require("gulp-imagemin");
var rename = require("gulp-rename");
var del = require("del");

var tasks = {
    mincss: function(){
        return gulp.src("src/**/*.css").pipe(mincss()).pipe(rename({ suffix: ".min" })).pipe(gulp.dest("dist"));
    },
    minjs: function(){
        return gulp.src("src/**/*.js").pipe(minjs()).pipe(rename({ suffix: ".min" })).pipe(gulp.dest("dist"));
    },
    minimage: function(){
        return gulp.src("src/**/*.png", { base: "src" }).pipe(minimage()).pipe(gulp.dest("dist"));
    },
    copy: function(){
        return gulp.src("src/**/*.svg", { base: "src" }).pipe(gulp.dest("dist"));
    }
}

gulp.task("clear", function(callback){
    return del(["dist/*"], callback);
});
gulp.task("mincss", tasks.mincss);
gulp.task("minjs", tasks.minjs);
gulp.task("minimage", tasks.minimage);
gulp.task("copy", tasks.copy);

gulp.task("default", ["clear"], function(){
    for(var key in tasks){
        tasks[key]();
    }
});
