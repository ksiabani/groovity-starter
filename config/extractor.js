'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    readdirp = require('readdirp'),
    config = require('../config/config'),
    ID3 = require('id3v2-parser'),
    mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/logger'),
    mailer = require('../config/mailer'),
    md5 = require('MD5'),
    async = require('async'),
    S = require('string'),
    tableify = require('tableify');

/**
 * Module init function.
 */
module.exports = function () {

    async.waterfall([

        function (callback) {

            var mp3Files = [];
            logger.info('Reading source folder', config.srcPath, 'for mp3 files');
            readdirp({root: config.srcPath, fileFilter: '*.mp3'}, function (errors, res) {

                if (errors) {
                    errors.forEach(function (err) {
                        logger.error('Error while reading source folder:', '\n', err);
                    });
                }
                res.files.forEach(function (file) {
                    mp3Files.push(file.fullPath);
                });
                logger.info('Finished reading source folder,', mp3Files.length, 'files found');
                callback(null, mp3Files);

            });

        },

        function (mp3Files, callback) {

            async.eachSeries(mp3Files, function (file, seriesCb) {

                logger.info('Processing file ' + file);
                var meta = {};
                var stream = fs.createReadStream(file);
                var extension;

                stream
                    .pipe(new ID3())
                    .on('data', function (tag) {

                        if (tag.type === 'TPE1') {
                            meta.artist = tag.value;
                        }
                        if (tag.type === 'TALB') {
                            meta.album = tag.value;
                        }
                        if (tag.type === 'TPUB') {
                            meta.publisher = tag.value;
                        }
                        if (tag.type === 'APIC' && tag.value.type === 'Cover (front)') {

                            extension = S(tag.value.mime).right(4).s === 'jpeg' ? 'jpeg' :  S(tag.value.mime).right(3).s;
                            meta.cover = md5(meta.artist + meta.album + meta.publisher) + '.' + extension;

                            // Using fs.stat,to check if file exists, fs.exists is deprecated in next version
                            fs.stat(config.artPath + '/' + meta.cover, function(err, stat) {

                                if(err == null) {
                                    logger.info('File exists, skipping...');
                                } else if(err.code == 'ENOENT') {
                                    fs.writeFile(config.artPath + '/' + meta.cover, tag.value.data, function(err) {
                                        if(err) {
                                            return logger.error("Cover for file ", file, " could not be retrieved. Cover name: ", meta.cover, ". Buffer length: ", tag.value.data.length);
                                        }
                                        logger.info("Cover was saved!");
                                    });
                                } else {
                                    logger.error('Something went wrong will retrieving cover art: ', err.code);
                                }
                            });
                        }

                    })
                    .on('end', function () {
                        logger.info('Finished reading metadata');
                        stream.destroy();
                        seriesCb();
                    });

            }, function (err) {

                if (err) {
                    logger.error('Error while processing a file:', '\n', err);
                } else {
                    logger.info('All files have been processed successfully');
                    callback(null, mp3Files);
                }

            });

        }

    ], function (err, mp3Files) {

        if (err) {
            logger.error('Extractor has encountered an error:', '\n', err);
        } else {
            logger.info('Extractor has finished. ' + mp3Files.length + ' track(s) were scanned.');
        }

    });

};
