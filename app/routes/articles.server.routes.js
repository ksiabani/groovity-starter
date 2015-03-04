'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	articles = require('../../app/controllers/articles.server.controller');

module.exports = function(app) {
    //I have used this in the past to enable CORS, use it with care if you have issues
    //app.use(function(req, res, next) {
    //    res.header("Access-Control-Allow-Origin", "*");
    //    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //    next();
    //});

	// Article Routes
	app.route('/articles')
		.get(articles.list)
		.post(users.requiresLogin, articles.create);

	app.route('/articles/:articleId')
		.get(articles.read)
		.put(users.requiresLogin, articles.hasAuthorization, articles.update)
		.delete(users.requiresLogin, articles.hasAuthorization, articles.delete);

	// Finish by binding the article middleware
	app.param('articleId', articles.articleByID);
};
