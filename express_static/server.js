    var express = require('express');
    var path = require('path');
    
    var app = express();

    //use static middleware in express to load static page directory
    app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000,function(){
    console.log('I\'m Listening...');
});