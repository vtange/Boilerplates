//this is app.js in MEAN-basic
var express = require('express'),
    app     = express();
    bodyParser  = require('body-parser'),
    mongoose  = require('mongoose'),
    listCtrller = require('./server/js/listCtrl.js')
    
/*-------*/
/*-USING MIDDLEWARE-*/
/*-------*/
//use bodyParser for any body parsing
app.use(bodyParser());

//use Mongoose to connect to database "stuff" in MongoDB
mongoose.connect('mongodb://localhost:27017/stuff');


/*-------*/
/*-LOAD STATIC PAGE-*/
/*-------*/
//'/' is root domain, "when someone access root domain, send index.html"
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client/views/index.html');
});

//get other html needed stuff
app.use('/js', express.static(__dirname + '/client/js'));
app.use('/css', express.static(__dirname + '/client/css'));


/*-------*/
/*-DATABASE INTERACT-*/
/*-------*/
//enable getting & posting with ngResource
app.get('/api/stuff', listCtrller.list);
app.post('/api/stuff', listCtrller.create);


/*-------*/
/*-PORT SETTING-*/
/*-------*/
//listen on port 3000 for ^
app.listen(3000,function(){
    console.log('I\'m Listening...');
});