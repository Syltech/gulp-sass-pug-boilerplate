const { src, dest, watch, parallel, series } = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const pug = require("gulp-pug");
const sass = require("gulp-sass");
const connect = require("gulp-connect");
const yaml = require("js-yaml");
const del = require("del");
const fs = require("fs");
const ftp = require("vinyl-ftp");

sass.compiler = require("node-sass");

let config;
let ftpconfig;

const server = (cb) => {
  connect.server({
    livereload: true,
    root: "dist",
  });
  cb();
};

const loadConfig = (cb) => {
  config = yaml.load(fs.readFileSync("./src/config.yaml"));
  ftpconfig = yaml.load(fs.readFileSync("./ftp-config.yaml"));
  cb();
};

const copyAssets = (cb) => {
  return src("assets/**/*").pipe(dest("dist/"));
};

const buildJS = (cb) => {
  const b = browserify({
    entries: "src/main.js",
  });

  return b
    .plugin("tinyify")
    .bundle()
    .pipe(source("main.js"))
    .pipe(buffer())
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

const remoteDeployTest = () => {
  return deploy(ftpconfig.test);
};

const remoteDeployProd = () => {
  return deploy(ftpconfig.prod);
};

const deploy = (config) => {
  let conn = ftp.create({
    host: config.FTP_SERVER,
    user: config.FTP_USER,
    password: config.FTP_PASSWORD,
    parallel: 10,
  });

  return src("dist/**/*", { base: "dist", buffer: false })
    .pipe(conn.newer(config.FTP_PATH))
    .pipe(conn.dest(config.FTP_PATH));
};

const watchers = () => {
  watch("src/**/*.js", { ignoreInitial: false }, buildJS);
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

exports.deployTest = series(this.default, remoteDeployTest);
exports.deployProd = series(this.default, remoteDeployProd);
