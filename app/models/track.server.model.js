'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Track Schema
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
    genre: {
        type: String,
        default: '',
        trim: true
    },
    path: {
        type: String,
        default: '',
        trim: true
    },
    //attached_picture: {
    //    data: Buffer,
    //    contentType: String
    //},
    comments: {
        type: String,
        default: '',
        trim: true
    },

        album: {
            type: String,
            default: '',
            trim: true
        },

        composer: {
            type: String,
            default: '',
            trim: true
        },


    date: {
        type: String,
        default: '',
        trim: true
    },
    languages: {
        type: String,
        default: '',
        trim: true
    },
        length: {
            type: String,
            default: '',
            trim: true
        },





        conductor: {
            type: String,
            default: '',
            trim: true
        },

    publisher: {
        type: String,
        default: '',
        trim: true
    },


        size: {
            type: String,
            default: '',
            trim: true
        },

        year: {
            type: String,
            default: '',
            trim: true
        },

	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Track', TrackSchema);
