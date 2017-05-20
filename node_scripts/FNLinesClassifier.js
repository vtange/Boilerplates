"use strict";
//NodeJS read-file-directly version: run by entering 'node FNLinesClassifier.js' in Git Bash.
//ES-2015 version

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

let fs = require("fs");
let natural = require("natural");
var POSlines = {};
var lines = require("./lines.js")();

//init POS tagger
let Tagger = natural.BrillPOSTagger;//".\node_modules\natural\lib\natural\brill_pos_tagger\lib\Brill_POS_Tagger.js"
let base_folder = "./node_modules/natural/lib/natural/brill_pos_tagger/data/English";
let rules_file = base_folder + "/tr_from_posjs.txt";
let lexicon_file = base_folder + "/lexicon_from_posjs.json";
let default_category = 'N'; //default to nouns
  /*------
  @ [Sentences] Tag part-of-speech in sentences
  -------*/
var tokenizer = new natural.TreebankWordTokenizer();
  /*------
  @ [Sentences] Break down str sentence into Penn treebank words
  -------*/
var tagger = new Tagger(lexicon_file, rules_file, default_category, function(error) {
  if (error)
  {
    console.log(error);
  }
  else
  {
    for(var file in lines){
      POSlines[file] = lines[file].map(function(line){
        return tagger.tag(tokenizer.tokenize(line)).map(function(term){return term[0]+" ("+term[1]+") "}).join(" ");
      });
    }

    write(POSlines,"POS_lines.js");
  };
});


