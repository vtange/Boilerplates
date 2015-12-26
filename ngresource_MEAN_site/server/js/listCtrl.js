//get Mongoose object
var listObj = require('../models/listObj');

//give Mongoose object (mongoose.model"ListObj") abilities
module.exports.list = function (req,res){
    listObj.find({}, function (err,results) {
        res.json(results);
    });
};

module.exports.create = function (req,res){
    var listobj = new listObj(req.body);
    listobj.save(function (err,result) {
        res.json(result);
    });
};
