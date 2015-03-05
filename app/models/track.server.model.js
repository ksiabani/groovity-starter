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
    label: {
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
    path: {
        type: String,
        default: '',
        trim: true
    },
    released: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },
    approved: {
        type: Boolean,
        default: false
    },
    copied: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Track', TrackSchema);
