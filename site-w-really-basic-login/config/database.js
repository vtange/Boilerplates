// config/database.js
module.exports = {

    'url' :  process.env.MONGOLAB_URI || 'mongodb://localhost/bookmon' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot

};
