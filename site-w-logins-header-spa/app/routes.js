console.log("	APP/ROUTES.JS")

// app/routes.js
module.exports = function(app) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs', {
            user : req.user, // get the user out of session and pass to template
			packagedUser : JSON.stringify(req.user) // for angular to know
        }); // load the index.ejs file
    });
};