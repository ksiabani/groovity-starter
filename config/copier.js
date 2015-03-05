'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/winston');


/**
 * Define copier
 */
var copier = function() {
    //Track.find({ approved: false, copied: false }, 'null', function (err, tracks) {
    Track.find({approved: false, copied: false}, 'title').exec(function(err, tracks) {
        if (err) logger.error(err);
        logger.info(tracks.path);
    });
};


//// name LIKE john and only selecting the "name" and "friends" fields, executing immediately
//MyModel.find({ name: /john/i }, 'name friends', function (err, docs) { })

/**
 * Export copier
 */
module.exports = copier;
