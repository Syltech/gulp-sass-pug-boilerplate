const { src, dest, watch, parallel, series } = require("gulp");
const uglify = require("gulp-uglify");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const connect = require("gulp-connect");
const yaml = require("js-yaml");
const del = require("del");
const fs = require("fs");

sass.compiler = require("node-sass");

let config;

const server = (cb) => {
  connect.server({
    livereload: true,
    root: "dist",
  });
  cb();
};

const loadConfig = (cb) => {
  config = yaml.load(fs.readFileSync("./src/config.yaml"));
  cb();
};

const copyAssets = (cb) => {
  return src("assets/**/*").pipe(dest("dist/"));
};

const buildJS = (cb) => {
  return src("src/*.js")
    .pipe(uglify())
    .pipe(dest("dist/"))
    .pipe(connect.reload());
};

const buildCSS = (cb) => {
  return src("src/scss/*.scss")
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(dest("dist/css/"))
    .pipe(connect.reload());
};

const buildHTML = (cb) => {
  return src("src/*.pug")
    .pipe(
      pug({
        pretty: false,
        data: config,
      })
    )
    .pipe(dest("dist/"))
    .pipe(connect.reload());
};

const cleanAll = () => {
  return del("dist");
};

const watchers = () => {
  watch("src/*.js", { ignoreInitial: false }, buildJS);
  watch("src/scss/*.scss", { ignoreInitial: false }, buildCSS);
  watch("src/**/*.pug", { ignoreInitial: false }, buildHTML);
  watch("src/*.yaml", { ignoreInitial: false }, series(loadConfig, buildHTML));
  watch("assets/**/*", { ignoreInitial: false }, series(copyAssets, buildHTML));
};

const watchModifications = series(cleanAll, watchers);

exports.default = series(
  cleanAll,
  parallel(buildCSS, buildJS, copyAssets, series(loadConfig, buildHTML))
);
exports.watch = series(server, watchModifications);
