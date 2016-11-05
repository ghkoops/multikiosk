var gulp = require( 'gulp-help' )( require( 'gulp' ) );
var shell = require( 'gulp-shell' );
var del = require( 'del' );
var jshint = require( 'gulp-jshint' );
var zip = require( 'gulp-zip' );
var bower = require( 'gulp-bower' );

gulp.task( 'clean', 'Cleans builed files.', function() {
    return del(
        [ 'dist/**' ] );
} );

gulp.task( 'build:chrome-extension', false,
    [ 'build:chrome-dist' ], function() {
    return gulp.src( 'dist/chrome-extension/**' ).pipe( zip( 'multikiosk-chrome-extension.zip' ) ).pipe( gulp.dest( 'dist' ) );
} );

gulp.task( 'build:chrome-dist', false, [ 'init' ], function() {
    return gulp.src(
        [ 'src/main/**' ] ).pipe( gulp.dest( 'dist/chrome-extension' ) );
} );

gulp.task( 'build:jsdoc', 'Generates jsdoc documentation', [ 'init' ], shell.task(
    [ './node_modules/jsdoc/jsdoc.js src/main/js/** -d dist/doc' ] ) );

gulp.task( 'build:lint', false, function() {
    return gulp.src( 'src/main/js/**' ).pipe( jshint() ).pipe( jshint.reporter( 'default' ) );
} );

gulp.task( 'build', "Generates files ready for distribution.",
    [ 'build:lint', 'build:jsdoc', 'build:chrome-extension' ] );

gulp.task( 'default', 'For development purposes. Constantly builds, without creating Chrome extension or documentation.',
    [ 'clean', 'build' ], function() {
    gulp.watch(
        [ './src/main/js/**', './src/main/html/**', './src/main/img/**' ],
        [ 'build' ] );
} );

// init
gulp.task( 'init', false,
    [ 'bower' ] );
gulp.task( 'bower', false, function() {
    return bower().pipe( gulp.dest( 'src/main/bower_components/' ) );
} );
