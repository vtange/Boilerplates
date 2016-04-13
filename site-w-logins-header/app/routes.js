
// app/routes.js
module.exports = function(app) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs', {
			title: app.title,
            user : req.user // get the user out of session and pass to template
        }); // load the index.ejs file
    });
};