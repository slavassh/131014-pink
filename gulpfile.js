"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var precss = require("precss");
var inlinesvg = require("postcss-inline-svg");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var mqpacker = require("css-mqpacker");
var csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps');
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');

gulp.task("style", function() {
  gulp.src("postcss/style.css")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss([
      precss(),
      inlinesvg(),
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
    .pipe(gulp.dest("css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("img/**/*.{png,jpg,gif}")
        .pipe(imagemin([
          imagemin.optipng({optimizationLevel: 3}),
          imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest('build/img'))
});

gulp.task("symbols", function() {
  return gulp.src("img/*.svg")
        .pipe(svgstore({
          inlineSvg: true
        }))
        .pipe(rename("symbols.svg"))
        .pipe(gulp.dest("build/img"));
});


gulp.task("serve", ["style"], function() {
  server.init({
    server: ".",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("postcss/**/*.css", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
});
