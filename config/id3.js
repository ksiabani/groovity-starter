'use strict';

/**
 * Module dependencies.
 */
var id3 = require('id3_reader'),
    errorHandler = require('../app/controllers/errors.server.controller'),
    path = require('path');

/**
 * Module init function.
 */
exports.read = function(path_to_file) {

    id3.read(path_to_file, function(err, data) {
        //console.log(err, data);
        if (err) {
            return errorHandler.getErrorMessage(err);
        } else {
            return data;
        }
    });
};
