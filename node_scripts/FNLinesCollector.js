
//NodeJS read-file-directly version: run by entering 'node FNLinesCollector.js' in Git Bash. '.txt' is req'd.
//ES-2015 version
var fs = require('fs');

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

function write(obj,filename){
		// To write to the system we will use the built in 'fs' library.
		// In this example we will pass 3 parameters to the writeFile function
		// Parameter 1 :  output.json - this is what the created filename will be called
		// Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
		// Parameter 3 :  callback function - a callback function to let us know the status of our function
		fs.writeFile(filename, "exports = module.exports = function(){return "+JSON.stringify(obj, null, 4)+"}", function(err){
            if(err) throw err;

			console.log(filename+' successfully written! - Check your project directory for the output.json file');
		});
}

var lines = {};

readFiles('src/', function(filename, content) {
  lines[filename] = content.toString().split("\r\n").map(function(str){
    
    return str.substring(str.lastIndexOf(",,")+2).replace(/\{[^\}]*\}|\\\N|\\\\/g,"");

  });
  write(lines,"lines.js");
	console.log("done");
}, function(err) {
  throw err;
});


