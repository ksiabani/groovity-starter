'use strict';

/**
 * Module dependencies.
 */
var walker = require('async-walker'),
    fs = require('fs'),
    config = require('../config/config'),
    id3 = require('id3_reader'),
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
            var coverId = shortId.generate();
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
                                        publisher: meta.publisher || 'publisher',
                                        genre: meta.genre || null,
                                        year: meta.year || null,
                                        released: new Date(meta.rip_date) || null,
                                        cover: Track.coverArt(meta.artist, meta.album, meta.publisher) || coverId,
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

                        var parser = mm(fs.createReadStream(filePath), function (err, meta) {
                            if (err) logger.error(err);
                            fs.writeFile(config.destPath + '/' + Track.cover || coverId + '.jpg', meta.picture[0].data, function(err){
                                if (err) logger.error(err);
                            });
                        });

                    //});

                });
            });
        }
        return statObject;
    });
};


