const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();

const { bower, vendorJs } = require('./vendors');
const { opts } = require('./options');

gulp.task('jade', function () {
    return gulp.src('./src/**/!(_)*.jade')
        .pipe($.plumber())
        .pipe($.data(function () {
            let list = require('../src/data/list.json');
            let ks = require('../src/data/ks.json');
            let lightbox = require('../src/data/lightbox.json')
            let src = {
                "list": list,
                "ks": ks,
                "lightbox": lightbox
            }
            return src 
        }))
        .pipe($.if(opts.env === 'develop', $.jade({
            pretty: true
        })))
        .pipe($.if(opts.env === 'production', $.jade()))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
});

gulp.task('sass', function () {
    return gulp.src('./src/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.postcss([autoprefixer()]))
        .pipe($.sass({
            includePaths: [
                './node_modules/bootstrap/scss/',
                './node_modules/lightbox2/dist/css/'
            ]
        }).on('error', $.sass.logError))
        .pipe($.if(opts.env === 'production', $.cleanCss()))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(browserSync.stream());
});

gulp.task('babel', () =>
    gulp.src('./src/js/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/env']
        }))
        .pipe($.concat('all.js'))
        .pipe($.if(opts.env === 'production', $.uglify({
            compress: {
                drop_console: true
            }
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js/'))
        .pipe(browserSync.stream())
);

gulp.task('image-min', function (){
    return gulp.src([
        './src/img/*',
        './node_modules/lightbox2/dist/images/*'
    ])
        .pipe($.imagemin())
        .pipe(gulp.dest('./dist/images/'))
})

gulp.task('clean', function () {
    return gulp.src(['./.tmp', './dist'],{
            read: false,
            allowEmpty: true
        })
        .pipe($.clean());
});

gulp.task('build',
    gulp.series(
        'clean',
        bower,
        vendorJs,
        gulp.parallel('jade', 'sass', 'babel', 'image-min')
    )
)

gulp.task('default',
    gulp.parallel(
        'jade',
        'sass',
        'babel',
        'image-min',
        gulp.series(bower, vendorJs),
        function (done) {
            browserSync.init({
                server: {
                    baseDir: "./dist/"
                }
            });

            gulp.watch('./src/**/*.jade', gulp.parallel('jade'));
            gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass'));
            gulp.watch('./src/js/**/*.js', gulp.parallel('babel'));
            done();
        }
    )
)