'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
	config = require('./config/config'),
	mongoose = require('mongoose'),
    logger = require('./config/logger'),
    CronJob = require('cron').CronJob
    //mailer = require('./config/mailer')
    ;

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
	if (err) {
        console.log('');
		logger.error('Could not connect to MongoDB!');
		logger.error(err);
	}
});

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
//require('./config/passport')();

/* Cron ranges:
 Seconds: 0-59
 Minutes: 0-59
 Hours: 0-23
 Day of Month: 1-31
 Months: 0-11
 Day of Week: 0-6
 */

//run at 00:00
//new CronJob('* * 0 * * *', function(){
    require('./config/downloader')();
//}, null, true, 'Europe/Athens');

//run at 04:00
//new CronJob('* 53 18 * * *', function(){
//    require('./config/reader')();
//}, null, true, 'Europe/Athens');

//run at 10:00
//new CronJob('* 41 19 * * *', function(){
//    require('./config/copier')();
//}, null, true, 'Europe/Athens');

//var body = '# Hello world!\n\nThis is a **markdown** message';
//mailer('this is the subject', body);

// Start the app by listening on <port>
//app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
logger.info('Groovity Starter started on port ' + config.port);

//TODO: truncate logs at startup
