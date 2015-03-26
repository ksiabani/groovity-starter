'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    config = require('../config/config'),
    mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/logger'),
    md5 = require('MD5'),
    async = require('async'),
    child_process = require('child_process'),
    execFile = require('child_process').execFile,
    spawn = require('child_process').spawn;

/**
 * Module init function.
 */
module.exports = function () {

    async.waterfall([

        function (callback) {
            Track
                .find({copied: false}, {
                    source: 1,
                    album: 1,
                    artist: 1,
                    title: 1,
                    genre: 1,
                    year: 1,
                    cover: 1,
                    filename_128: 1
                })
                .limit(2)
                .exec(function (err, tracks) {
                    if (err) {
                        logger.error('Error while querying database:', '\n', err);
                    }
                    else {
                        callback(null, tracks);
                    }
                });
        },

        function (tracks, callback) {

            var exitCode = 0;
            var convertedTracks = [];
            var Tracks = JSON.parse(JSON.stringify(tracks));
            async.eachSeries(Tracks, function (track, seriesCb) {
                //osx & nas
                //var ffmpeg = execFile('ffmpeg', [
                //windows
                var ffmpeg = spawn(process.env.comspec, ['/c', 'C:\\Temp\\ffmpeg\\bin\\ffmpeg',
                    '-y', /* ovewrite existing files */
                    '-i', track.source, /* source */
                    '-map_metadata', '0', '-id3v2_version', '3', /* keep metadata */
                    '-metadata', 'track=', '-metadata', 'encoded_by=', '-metadata', 'Supplier=', '-metadata', 'Ripping tool=',
                    '-metadata', 'encoder=', '-metadata', 'Catalog #=', '-metadata', 'Rip date=', '-metadata', 'Release type=',
                    '-metadata', 'Source=', '-metadata', 'Publisher=', '-metadata', 'TDAT=', '-metadata', 'Comment=', '-metadata', 'Track Number=',
                    '-vn', '-b:a', '128k', '-c:a', 'libmp3lame', '-f', 'mp3', config.destPath + track.filename_128
                    //'-codec:a', 'libmp3lame', '-b:a', '128k', config.destPath + track.filename_128
                    //'-ab', '128k', config.destPath + track.filename_128 /* convert to 128 */
                ]);
                //ffmpeg -i input.wav -codec:a libmp3lame -b:a 128k output.mp3
                //"-vn -b:a 128k -c:a libmp3lame -f mp3" //this is from ampache

                ffmpeg.stdout.on('data', function (data) {
                    logger.info(data.toString());
                });

                ffmpeg.stderr.on('data', function (data) {
                    logger.info(data.toString());
                });

                ffmpeg.on('close', function (code) {
                    exitCode += code;
                    if (code === 0) {
                        convertedTracks.push(track.source.toString());
                    }
                    seriesCb();
                });

            }, function (err) {
                if (err) {
                    logger.error('Error while processing a file:', '\n', err);
                } else {
                    if (exitCode === 0) {
                        logger.info('All files have been processed successfully');
                    }
                    else {
                        logger.error('Not all files have been processed successfully');
                    }
                    callback(null, Tracks, convertedTracks);
                }
            });
        },

        function (Tracks, convertedTracks, callback) {
            Track
                .update({source: {$in: convertedTracks}}, {copied: true}, {multi: true})
                .exec(function (err) {
                    if (err) {
                        logger.error('Error while updating database:', '\n', err);
                    }
                    else {
                        callback(null, Tracks, convertedTracks);
                    }
                });
        }

    ], function (err, Tracks, convertedTracks) {
        if (err) {
            logger.error('Copier has encountered an error:', '\n', err);
        } else {
            logger.info('Copier has finished. ' + convertedTracks.length + ' of ' + Tracks.length + ' track(s) were copied');
        }
    });
};
