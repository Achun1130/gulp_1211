const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const mainBowerFiles = require('main-bower-files');

const { opts } = require('./options');

function bower() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors/'))
}

function vendorJs() {
    return gulp.src([
        './.tmp/**/*.js',
        './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
        './node_modules/lightbox2/dist/js/lightbox.js',
    ])
        .pipe($.concat('vendors.js'))
        .pipe($.if(opts.env === 'production', $.uglify({
            compress: {
                drop_console: true
            }
        })))
        .pipe(gulp.dest('./dist/js/'))
}

exports.bower = bower;
exports.vendorJs = vendorJs;
