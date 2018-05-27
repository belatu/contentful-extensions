import gulp from 'gulp';
import sass from 'gulp-sass';
import noop from 'gulp-noop';
import inlineSource from 'gulp-inline-source';
import uglify from 'gulp-uglify';
import del from 'del';
import browserSync from 'browser-sync';
import browserify from 'browserify';
import babel from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import { argv } from 'yargs';

const PORT = 1234;
const SRC = './src';
const DEST = './dist';
const PATHS = {
  scripts: `${SRC}/index.js`,
  styles: `${SRC}/index.scss`,
  html: `${SRC}/index.html`
};

const isDev = !argv.production;
const server = browserSync.create();

// Serve dist folder on port 1234 for local development.
const serve = done => {
  server.init({
    port: PORT,
    https: true,
    server: {
      baseDir: DEST
    }
  });
  done();
};

const reload = done => {
  server.reload();
  done();
};

export const clean = () => del([DEST]);

const scripts = () =>
  browserify(PATHS.scripts)
    .transform(babel)
    .bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(isDev ? noop() : uglify())
    .pipe(gulp.dest(DEST));

const styles = () =>
  gulp
    .src(PATHS.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(DEST));

const html = () => gulp.src(PATHS.html).pipe(gulp.dest(DEST));

// Serve and watch for changes so we don't have to run `gulp` after each change.
const watch = () => {
  gulp.watch(PATHS.scripts, gulp.series(scripts, reload));
  gulp.watch(PATHS.styles, gulp.series(styles, reload));
  gulp.watch(PATHS.html, gulp.series(html, reload));
};

// Bundles the whole widget into one file which can be uploaded to Contentful.
const inline = () =>
  gulp
    .src(`${DEST}/index.html`)
    .pipe(inlineSource())
    .pipe(gulp.dest(DEST));

export const build = gulp.series(clean, gulp.parallel(scripts, styles, html));
export const dev = gulp.series(build, serve, watch);
export const bundle = gulp.series(build, inline);
