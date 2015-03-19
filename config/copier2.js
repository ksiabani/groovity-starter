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
    //logger = require('../config/logger'),
    md5 = require('MD5'),
    async = require('async'),
    S = require('string'),
    fsSync = require('fs-sync');

/**
 * Module init function.
 */
module.exports = function () {

    //async.waterfall([
    //    function(callback) {
    //        callback(null, 'one', 'two');
    //    },
    //    function(arg1, arg2, callback) {
    //        // arg1 now equals 'one' and arg2 now equals 'two'
    //        callback(null, 'three');
    //    },
    //    function(arg1, callback) {
    //        // arg1 now equals 'three'
    //        callback(null, 'done');
    //    }
    //], function (err, result) {
    //    // result now equals 'done'
    //});
    //
      async.waterfall([
        function(callback) {
            Track.find({ copied: false }, {source: 1, album: 1, artist: 1, title: 1, cover: 1}).exec( function(err, tracks) {
                //if (err) logger.error(err);
                callback(null, tracks);
            });
        },
        //function(tracks, callback) {
        //
        //    JSON.parse(JSON.stringify(tracks)).forEach(function(track) {
        //        var stream = fs.createReadStream(track.source);
        //        stream
        //            .pipe(new ID3())
        //            .on('data', function(tag){
        //                if(tag.type === 'APIC' && tag.value.type === 'Cover (front)'){
        //                    fs.writeFile(config.artPath + '/' + track.cover, tag.value.data, function(err){
        //                        if (err) logger.error(err);
        //                    });
        //                }
        //            })
        //            .on('end', function(){
        //                logger.info('Finished reading metadata');
        //                stream.destroy();
        //            });
        //    });
        //    callback(null, tracks);
        //},
        function(tracks, callback) {
            JSON.parse(JSON.stringify(tracks)).forEach(function(track) {
                console.log('Copying', track.source)
                fsSync.copy(track.source, config.destPath + track.album.replace(/ /g, '_') + '-' + track.artist.replace(/ /g,'_') + '-' + track.title.replace(/ /g,'_') + '.mp3');

                //var readable = fs.createReadStream(track.source);
                //var writeable =  fs.createWriteStream(config.destPath + track.album.replace(/ /g, '_') + '-' + track.artist.replace(/ /g,'_') + '-' + track.title.replace(/ /g,'_') + '.mp3');
                //readable.pipe(writeable);
                //stream.pipe(res)
                //onFinished(writeable, function (err) {
                //    if(err) console.log(err);
                //    destroy(readable);
                //});
            });

            //var destroy = require('destroy')
            //var http = require('http')
            //var onFinished = require('on-finished')
            //
            //http.createServer(function onRequest(req, res) {
            //    var stream = fs.createReadStream('package.json')
            //    stream.pipe(res)
            //    onFinished(res, function (err) {
            //        destroy(stream)
            //    })
            //})

            //var myFiles = [];
            //JSON.parse(JSON.stringify(tracks)).forEach(function(track) {
            //    myFiles.push(track.source);
            //});
            //
            //async.eachSeries(myFiles, function(file, callback) {
            //
            //    // Perform operation on file here.
            //    console.log('Processing file ' + file);
            //
            //    var readable = fs.createReadStream(file);
            //    var writeable =  fs.createWriteStream(config.destPath + track.album.replace(/ /g, '_') + '-' + track.artist.replace(/ /g,'_') + '-' + track.title.replace(/ /g,'_') + '.mp3');
            //    readable.pipe(writeable);
            //    callback();
            //}, function(err){
            //    // if any of the file processing produced an error, err would equal that error
            //    if( err ) {
            //        // One of the iterations produced an error.
            //        // All processing will now stop.
            //        console.log('A file failed to process');
            //    } else {
            //        console.log('All files have been processed successfully');
            //    }
            //});
            callback(null, 'done');
        }
    ], function (err, result) {
        console.log('Hey!');
    });
};

//TODO: Review the fields that are being updated

