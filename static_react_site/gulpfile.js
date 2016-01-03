// Include gulp	& plugins
var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify'); 
var concat = require('gulp-concat');

//Lots of JS + scripts task == build/js/main.js, + browserify task == build/js/main.js with dependencies put in

// Watch Task
gulp.task('watch', function(){
	//Watch the JS folder
	gulp.watch('js/*js', ['scripts']);
})

// Concatenate JS Files
gulp.task('scripts', function() {
    return gulp.src('js/*.js')
      .pipe(concat('main.js'))
      .pipe(gulp.dest('build/js'));
});

// enable require() within JS Files
gulp.task('browserify', function() {
    var bundler = browserify({
        entries: ['build/main.js'], // Only need initial file, browserify finds the deps
        transform: [babelify], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });
    var watcher  = watchify(bundler);

    return watcher
    .on('update', function () { // When any files update
        var updateStart = Date.now();
        console.log('Updating!');
        watcher.bundle() // Create new bundle that uses the cache for high performance
        .pipe(source('main.js'))
    // This is where you add uglifying etc.
        .pipe(gulp.dest('final/js'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle() // Create the initial bundle when starting the task
    .pipe(source('main.js'))
// This is where you add uglifying etc.
    .pipe(gulp.dest('final/js'));
});


// Default Task
gulp.task('default', ['scripts','browserify','watch']);