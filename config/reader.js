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
    md5 = require('MD5'),
    async = require('async'),
    S = require('string');

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
                logger.info('Reading source folder finished,', mp3Files.length, 'files found');
                callback(null, mp3Files);
            });
        },

        function (mp3Files, callback) {

            async.eachSeries(mp3Files, function (file, seriesCb) {
                logger.info('Processing file ' + file);
                var meta = {};
                var stream = fs.createReadStream(file);
                stream
                    .pipe(new ID3())
                    .on('data', function (tag) {
                        if (tag.type === 'TPE1') {
                            meta.artist = tag.value;
                        }
                        if (tag.type === 'TALB') {
                            meta.album = tag.value;
                        }
                        if (tag.type === 'TIT2') {
                            meta.title = tag.value;
                        }
                        if (tag.type === 'TYER') {
                            meta.year = tag.value;
                        }
                        if (tag.type === 'TCON') {
                            meta.genre = tag.value;
                        }
                        if (tag.type === 'TPUB') {
                            meta.publisher = tag.value;
                        }
                        if (tag.type === 'APIC' && tag.value.type === 'Cover (front)') {
                            meta.cover = md5(meta.artist + meta.album + meta.publisher) + '.' + S(tag.value.mime).chompLeft('image/').s;
                        }
                        if (tag.type === 'TXXX' && S(tag.value).left(9).s === 'Rip date/') {
                            meta.released = S(tag.value).chompLeft('Rip date/').s;
                        }
                        meta.filename_128 = md5(meta.album + meta.artist + meta.title + '128') + '.mp3';
                    })
                    .on('end', function () {
                        logger.info('Finished reading metadata');
                        stream.destroy();
                        Track
                            .findOneAndUpdate(
                            {
                                source: file
                            },
                            {
                                $setOnInsert: {
                                    artist: meta.artist,
                                    title: meta.title,
                                    album: meta.album,
                                    publisher: meta.publisher,
                                    genre: meta.genre || null,
                                    year: meta.year || null,
                                    released: new Date(meta.released) || null,
                                    cover: meta.cover || null,
                                    source: file,
                                    filename_128: meta.filename_128,
                                    created: Date.now(),
                                    copied: false
                                }
                            },
                            {
                                upsert: true
                            }
                        ).exec(function (err) {
                                if (err) logger.error('Error while storing metadata for file', file, ': \n', err);
                            });
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
            logger.error('Reader has encountered an error:', '\n', err);
        } else {
            logger.info('Reader has finished. ' + mp3Files.length + ' track(s) were scanned and added to database');
        }
    });

};

//TODO: Review the fields that are being updated
