'use strict';

/**
 * Module dependencies.
 */
var walker = require('async-walker'),
    fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    chalk = require('chalk'),
    id3 = require('id3_reader'),
    //errorHandler = require('../app/controllers/errors.server.controller'),
    //tracks = require('../app/controllers/tracks.server.controller'),
    mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/winston');

/**
 * Module init function.
 */
module.exports = (function () {

    console.log(chalk.blue('Walker started in ' + config.walkPath));
    walker(config.walkPath, function(statObject) {
        var filePath = statObject.path;
        if (statObject.isFile && filePath.substr(-4) === '.mp3') {
            // if you need dirname: path.dirname(filePath)
            var file = fs.readFile(filePath, function(err, buffer) {
                id3.read(buffer, function(err, meta) {
                    console.log(chalk.blue('Reading ' + filePath));
                    Track.findOneAndUpdate(
                        {
                            path: filePath
                        },
                        {
                            artist: meta.artist,
                            title: meta.title,
                            album: meta.album,
                            label: meta.publisher || null,
                            genre: meta.genre,
                            year: meta.year || null,
                            released: meta.rip_date? new Date(meta.rip_date): null,
                            created: Date.now(),
                            path: filePath
                        },
                        {
                            upsert: true
                        }
                    ).exec(function (err) {
                        if (err) {
                            logger.error(err);
                        }
                    });
                });

            });
        }
        return statObject;
    });

})();
