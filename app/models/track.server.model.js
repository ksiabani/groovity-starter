'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Track Schema
 *
 */
var TrackSchema = new Schema({
	artist: {
		type: String,
		default: '',
		trim: true
	},
    title: {
        type: String,
        default: '',
        trim: true
    },
    album: {
        type: String,
        default: '',
        trim: true
    },
    publisher: {
        type: String,
        default: '',
        trim: true
    },
    genre: {
        type: String,
        default: '',
        trim: true
    },
    year: {
        type: String,
        default: '',
        trim: true
    },
    released: {
        type: Date,
        default: Date.now
    },
    source_path: {
        type: String,
        default: '',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    copied: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Track', TrackSchema);
