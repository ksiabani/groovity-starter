'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Track = mongoose.model('Track'),
	_ = require('lodash');

/**
 * Create a Track
 */
exports.create = function(req, res) {
	var track = new Track(req.body);
	track.user = req.user;

	track.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(track);
		}
	});
};

/**
 * Show the current Track
 */
exports.read = function(req, res) {
	res.jsonp(req.track);
};

/**
 * Update a Track
 */
exports.update = function(req, res) {
	var track = req.track ;

	track = _.extend(track , req.body);

	track.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(track);
		}
	});
};

/**
 * Delete an Track
 */
exports.delete = function(req, res) {
	var track = req.track ;

	track.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(track);
		}
	});
};

/**
 * List of Tracks
 */
exports.list = function(req, res) {
	Track.find().sort('-created').populate('user', 'displayName').exec(function(err, tracks) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(tracks);
		}
	});
};

/**
 * Track middleware
 */
exports.trackByID = function(req, res, next, id) {
	Track.findById(id).populate('user', 'displayName').exec(function(err, track) {
		if (err) return next(err);
		if (! track) return next(new Error('Failed to load Track ' + id));
		req.track = track ;
		next();
	});
};

/**
 * Track authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.track.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

/**
 *  Finds a matching document, updates it according to the update arg or inserts it if not found
 *  This is currently only used by walker and not returning http responses
 */
exports.upsert = function (conditions, update) {
    Track.findOneAndUpdate(conditions, update, {upsert: true}).exec(function(err, track) {
        if (err) {
            return errorHandler.getErrorMessage(err);
        }
    });
};

exports.coverArt = function(artist, album, publisher){
    Track.findOne({ artist: artist, album: album, publisher: publisher }, 'cover').exec(function (err, track) {
        if (err) return (err);
            return track;
        });
};
