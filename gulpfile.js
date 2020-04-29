var gulp = require('gulp');
var gulpConcat = require('gulp-concat');
var tap = require('gulp-tap');
var runSequence = require('gulp4-run-sequence');
var uglify = require('gulp-uglify');
var cleanCss = require('gulp-clean-css');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var postcssImport = require('postcss-easy-import');
var postcssColorFunction = require('postcss-color-function');
var postcssHexrgba = require('postcss-hexrgba');
var postcssConditionals = require('postcss-conditionals');
var postcssCustomProperties = require('postcss-custom-properties');
var browserify = require('browserify');
var stringify = require('stringify');
var buffer = require('gulp-buffer');

var postcssProcesses = [
  postcssImport,
  postcssCustomProperties(),
  postcssConditionals,
  postcssHexrgba(),
  postcssColorFunction(),
  autoprefixer()
];
var assetDest = 'asset/';
var jsSitemaps = true;

gulp.task('default', buildProduction);
gulp.task('watch', watch);
gulp.task('min', min);
gulp.task('css', css);
gulp.task('cssMin', cssMin);
gulp.task('js', js);
gulp.task('jsLib', jsLib);
gulp.task('jsMin', jsMin);

function buildProduction(done) {
  jsSitemaps = false;
  runSequence(
    'css',
    'cssMin',
    'js',
    'jsMin'
  );
  done()
}

function min(done) {
  runSequence(
    'cssMin',
    'jsMin'
  );
  done()
}

function watch(done) {
  gulp.watch('css/**/*.css', ['css']);
  gulp.watch('js/**/*.js', ['js']);
  done()
}

function js(done) {
  return gulp.src('js/' + '**/*.bundle.js', {read: false})
    .pipe(tap(function(file) {
      file.contents = browserify(file.path, {debug: jsSitemaps})
        .transform(stringify, {
          global: true,
          appliesTo: {includeExtensions: ['.mst', '.mustache']},
          minify: true
        })
        .bundle();
    }))
    .pipe(buffer())
    .pipe(gulp.dest(assetDest));
    done()
};

function css(done) {
  return gulp.src('css/' + '**/*.bundle.css')
    .pipe(postcss(postcssProcesses))
    .pipe(tap(function(file) {
    }))
    .pipe(gulp.dest(assetDest));
    done()
};

function cssMin(done) {
  return gulp.src(assetDest + '**/*.css')
    .pipe(cleanCss({
      level: 0
    }))
    .pipe(tap(function(file) {
    }))
    .pipe(gulp.dest(assetDest));
    done()
}

function jsLib(done) {
  gulp.src([
      'node_modules/mustache/mustache.js'
    ])
    .pipe(tap(function(file) {
    }))
    .pipe(gulpConcat('lib.js'))
    .pipe(gulp.dest(assetDest));
    done()
}

function jsMin(done) {
  return gulp.src(assetDest + '**.js')
    .pipe(uglify())
    .pipe(tap(function(file) {
    }))
    .pipe(gulp.dest(assetDest));
    done()
}

