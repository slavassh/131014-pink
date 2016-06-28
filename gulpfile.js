"use strict";

var gulp            = require("gulp");
var plumber         = require("gulp-plumber");
var postcss         = require("gulp-postcss");
var precss          = require("precss");
var inlinesvg       = require("postcss-inline-svg");
var inlinesvgopt    = require('postcss-svgo')
var autoprefixer    = require("autoprefixer");
var server          = require("browser-sync");
var mqpacker        = require("css-mqpacker");
var csso            = require('gulp-csso');
var sourcemaps      = require('gulp-sourcemaps');
var rename          = require("gulp-rename");
var imagemin        = require('gulp-imagemin');
var svgstore        = require('gulp-svgstore');
var del             = require("del");
var runSequence     = require('run-sequence');

gulp.task("style", function() {
  gulp.src("postcss/style.css")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss([
      precss(),
      inlinesvg(),
      inlinesvgopt(),
      mqpacker({
        sort: true
      }),
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]})
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("copy", function() {
  return gulp.src([
      "fonts/**/*.{woff,woff2}",
      "img/**/*.{png,jpg}",
      "js/**",
      "*.html"
    ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});


gulp.task('html-js-watch', ['copy-html-js'], server.reload);
gulp.task('image-watch', ['build'], server.reload);

gulp.task("copy-html-js", function() {
  return gulp.src([
      "js/**",
      "*.html"
    ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
 return del("build");
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
        .pipe(imagemin([
          imagemin.optipng({optimizationLevel: 3}),
          imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest('build/img'))
});

gulp.task("symbols", function() {
  return gulp.src("img/icons/*.svg")
        .pipe(svgstore({
          inlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("build/img/icons"));
});


gulp.task("serve", function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
    //tunnel: true
  });

  gulp.watch("postcss/**/*.css", ["style"]);
  gulp.watch("img/**/*.*", ["image-watch"]);
  gulp.watch("*.html", ['html-js-watch']);
  gulp.watch("js/**/*.js", ['html-js-watch']);

});

gulp.task("build", function(fn) {
  runSequence(
    "clean",
    "copy",
    "style",
    "images",
    "symbols",
    fn
  );
});
