'use strict';

/**
 * Module dependencies.
 */
var walker = require('async-walker'),
    fs = require('fs'),
    config = require('../config/config'),
    id3 = require('id3_reader'),
    mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/logger'),
    md5 = require('MD5');

/**
 * Module init function.
 */
module.exports = function () {

    logger.info('Reader started in ' + config.walkPath);
    walker(config.walkPath, function(statObject) {
        var filePath = statObject.path;
        if (statObject.isFile && filePath.substr(-4) === '.mp3') {
            // if you need dirname: path.dirname(filePath)
            var file = fs.readFile(filePath, function(err, buffer) {
                id3.read(buffer, function(err, meta) {
                    logger.info('Reading ' + filePath);
                            Track.findOneAndUpdate(
                                {
                                    source_path: filePath
                                },
                                {
                                    $setOnInsert: {
                                        artist: meta.artist,
                                        title: meta.title,
                                        album: meta.album,
                                        publisher: meta.publisher,
                                        genre: meta.genre || null,
                                        year: meta.year || null,
                                        released: new Date(meta.rip_date) || null,
                                        cover: md5(meta.artist + meta.album + meta.publisher),
                                        source_path: filePath,
                                        created: Date.now(),
                                        copied: false
                                    }
                                },
                                {
                                    upsert: true
                                }
                            ).exec(function (err) {
                                    if (err) logger.error(err);
                                });
                });
            });
        }
        return statObject;
    });
};

//TODO: Review the fields that are being updated
