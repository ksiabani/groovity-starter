'use strict';

/**
 * Module dependencies.
 */
var walker = require('async-walker'),
    fs = require('fs'),
    config = require('../config/config'),
    mm= require('musicmetadata'),
    mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/logger'),
    shortId = require('shortid');

/**
 * Module init function.
 */
module.exports = function () {

    logger.info('Reader started in ' + config.walkPath);
    walker(config.walkPath, function(statObject) {
        var filePath = statObject.path;
        if (statObject.isFile && filePath.substr(-4) === '.mp3') {
            // if you need dirname: path.dirname(filePath)
            //var file = fs.readFile(filePath, function(err, buffer) {
            //    id3.read(buffer, function(err, meta) {
            // create a new parser from a node ReadStream
            var parser = mm(fs.createReadStream(filePath), function (err, meta) {
                if (err) throw err;
                console.log(meta.artist, meta.title, meta.picture[0].format);
            //});

                    logger.info('Reading ' + filePath);
                    var coverId = shortId.generate();
                    Track.findOneAndUpdate(
                        {
                            source_path: filePath
                        },
                        {
                            $setOnInsert: {
                                artist: meta.artist,
                                title: meta.title,
                                album: meta.album,
                                publisher: meta.publisher || null,
                                genre: meta.genre || null,
                                year: meta.year || null,
                                released: new Date(meta.rip_date) || null,
                                cover: coverId,
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
                            logger.info('Record was inserted');

                        });
                //});
            });
        }
        return statObject;
    });
};
