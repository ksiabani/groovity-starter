'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose');
    //logger = require('./config/logger'),
    //CronJob = require('cron').CronJob;

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
        console.log('');
		//logger.error('Could not connect to MongoDB!');
		//logger.error(err);
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
//require('./config/passport')();

//runs at 04:00
//new CronJob('* * 4 * * *', function(){
//    require('./config/reader2')();
//}, null, true, 'Europe/Athens');

//runs at 10:00
//new CronJob('* * 10 * * *', function(){
//    require('./config/copier')();
//}, null, true, 'Europe/Athens');

//require('./config/mailer')();

require('./config/copier')();


// Start the app by listening on <port>
//app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
//logger.info('Groovity Starter started on port ' + config.port);

//TODO: truncate logs at startup


