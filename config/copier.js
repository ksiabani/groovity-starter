'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    readdirp = require('readdirp'),
    config = require('../config/config'),
    ID3 = require('id3v2-parser'),
    mm = require('musicmetadata'),
    mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/logger'),
    md5 = require('MD5'),
    async = require('async'),
    S = require('string'),
//fsSync = require('fs-sync'),
    sanitize = require('sanitize-filename'),
    child_process = require('child_process'),
    execFile = require('child_process').execFile,
    spawn = require('child_process').spawn;


//var spawn = require('child_process').spawn,
//    ls    = spawn('ls', ['-lh', '/usr']);
//
//ls.stdout.on('data', function (data) {
//    console.log('stdout: ' + data);
//});
//
//ls.stderr.on('data', function (data) {
//    console.log('stderr: ' + data);
//});
//
//ls.on('close', function (code) {
//    console.log('child process exited with code ' + code);
//});

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
                    cover: 1
                })
                .limit(1)
                .exec(function (err, tracks) {
                    if (err) logger.error(err);
                    callback(null, tracks);
                });
        },

        function (tracks, callback) {
            console.log('ok, got tracks');
            var tracksArray = JSON.parse(JSON.stringify(tracks));
            async.eachSeries(tracksArray, function (track, callback2) {
                //ffmpeg -i one.mp3 file.jpg
                //var source = track.source;
                //var target = config.destPath + sanitize(track.album.replace(/ /g, '_') + '-' + track.artist.replace(/ /g, '_') + '-' + track.title.replace(/ /g, '_')) + '.mp3';
                //var ffmpeg = execFile('ffmpeg', ['-y', '-i', track.source, config.artPath + '/' + track.cover]);
                //var ffmpeg = execFile('ffmpeg', ['-y', '-i', track.source, '-c:a', 'copy', config.artPath + '/' + 'out.mp3']);
                //windows
                var ffmpeg = spawn(process.env.comspec, ['/c',
                    'C:\\Temp\\ffmpeg\\bin\\ffmpeg',                        //command
                    '-y',                                                   //global switches
                    '-i', track.source,                                     //input
                    '-c:a', 'copy', config.artPath + '/' + 'out1.mp3',      //first output, just copy the file
                    '-metadata', 'track= ', 'encoded_by= ', 'Supplier= ', 'Ripping tool= ', 'encoder= ', //set metadata 'Catalog \#= ', 'Rip date= ', 'Release type= ', 'Source= ',
                    '-b:a', '128k', '-f', 'mp3', config.artPath + '/' + 'out2.mp3', //second output, converting to 128
                    '-f', 'ffmetadata', config.artPath + '/' +'metadata.txt',       //extract metadata to a file
                    config.artPath + '/' + track.cover                              //extract artwork
                ]);
                //ffmpeg -i son_origine.avi -vn -ar 44100 -ac 2 -ab 192 -f mp3 son_final.mp3
                //ffmpeg -i original.mp4 -metadata title="my title" -c copy -y /tmp/tmp.mp4 && ffmpeg -i /tmp/tmp.mp4 -c copy -y original.mp4

                //cp.stdout.on("data", function(data) {
                //    console.log(data.toString());
                //});
                //
                //cp.stderr.on("data", function(data) {
                //    console.error(data.toString());
                //});

                ffmpeg.stdout.on('data', function (data) {
                    console.log('stdout: ' + data);
                });

                ffmpeg.stderr.on('data', function (data) {
                    console.log('stderr: ' + data);
                });

                ffmpeg.on('close', function (code) {
                    console.log('child process exited with code ' + code);
                    callback2();
                });

                //child_process.execFile('ffmpeg', ['-i', track.source, track.cover], function (err) {
                //    if (err) console.log(err);
                //    callback2();
                //});

                //var parser = mm(fs.createReadStream(track.source), function (err, meta) {
                //    if (err) logger.error(err);
                //    fs.writeFile(config.destPath + '/' + track.cover, meta.picture[0].data, function (err) {
                //        if (err) logger.error(err);
                //        callback2();
                //    });
                //});

                //var stream = fs.createReadStream(track.source);
                //stream
                //    .pipe(new ID3())
                //    .on('data', function (tag) {
                //        if (tag.type === 'APIC' && tag.value.type === 'Cover (front)') {
                //            fs.writeFile(config.artPath + '/' + track.cover, tag.value.data, function (err) {
                //                if (err) logger.error(err);
                //            });
                //        }
                //    })
                //    .on('end', function () {
                //        logger.info('Finished reading metadata');
                //        stream.destroy();
                //        callback2();
                //    });

            }, function (err) {
                // if any of the file processing produced an error, err would equal that error
                if (err) {
                    // One of the iterations produced an error.
                    // All processing will now stop.
                    console.log('A file failed to process');
                } else {
                    console.log('All files have been processed successfully');
                    //callback(null, tracks);
                    callback(null, 'done');
                }
            });

        },

        //function (tracks, callback) {
        //    console.log('ok, got tracks');
        //    var tracksArray = JSON.parse(JSON.stringify(tracks));
        //    async.eachSeries(tracksArray, function (track, callback2) {
        //        console.log('Processing file ' + track.source);
        //        var source = track.source;
        //        var target = config.destPath + sanitize(track.album.replace(/ /g, '_') + '-' + track.artist.replace(/ /g, '_') + '-' + track.title.replace(/ /g, '_')) + '.mp3';
        //        child_process.execFile('cp', [source, target], function (err) {
        //            if (err) console.log(err);
        //            callback2();
        //        });
        //    }, function (err) {
        //        // if any of the file processing produced an error, err would equal that error
        //        if (err) {
        //            // One of the iterations produced an error.
        //            // All processing will now stop.
        //            console.log('A file failed to process');
        //        } else {
        //            console.log('All files have been processed successfully');
        //            callback(null, 'done');
        //        }
        //    });
        //}

    ], function (err, result) {
        console.log('Hey!');
    });
};



