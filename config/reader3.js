/**
 * Created by ksiabani on 12/3/2015.
 */
'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    config = require('../config/config'),
    ID3 = require('id3v2-parser'),
    id3 = require('id3_reader'),
    mm = require('musicmetadata'),
    //mongoose = require('mongoose'),
    //Track = mongoose.model('Track'),
    //logger = require('../config/logger'),
    //md5 = require('MD5'),
    es = require('event-stream'),
    async = require('async');


/**
 * Module init function.
 */
module.exports = function () {
    console.log('start of response');
    readdirp({ root: config.walkPath, fileFilter: '*.mp3' }, function (errors, res) {
        if (errors) {
            errors.forEach(function (err) {
                console.error('Error: ', err);
            });
        }
        var myFiles = [];
        res.files.forEach(function(file){
            myFiles.push(file.fullPath);
        });
        console.log(myFiles);
        console.log('end of response');

        async.eachSeries(myFiles, function(file, callback) {

            // Perform operation on file here.
            console.log('Processing file ' + file);

            //id3v1/v2
            fs.createReadStream(file)
                .pipe(new ID3())
                .on('data', function(tag){
                    console.log( tag.type, tag.value );
                })
                .on('end', function(){
                    console.log( 'the end' );
                    callback();
                });



            //id3_reader
            //id3.read(file, function(err, meta) {
            //    if (err) console.log(err);
            //    console.log(meta, file);
            //
            //});
            //console.log('File processed');
            //callback();

            //mm
            //var parser = mm(fs.createReadStream(file), function (err, metadata) {
            //    if (err) console.log(err);
            //    console.log(metadata);
            //    console.log('File processed');
            //    callback();
            //});


        }, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A file failed to process');
            } else {
                console.log('All files have been processed successfully');
            }
        });



    });



    //var stream = readdirp({ root: config.walkPath, fileFilter: '*.mp3' });
    //stream
    //    .on('warn', function (err) {
    //        console.error('non-fatal error', err);
    //        // optionally call stream.destroy() here in order to abort and cause 'close' to be emitted
    //    })
    //    .on('error', function (err) { console.error('fatal error', err); })
    //    //.on('end' , function (err) { });
    //    //.pipe(es.stringify())
    //    //.pipe(fs.createWriteStream('out.txt'));
    //    .pipe(es.mapSync(function (entry) {
    //        //return { path: entry.fullPath }; //, size: entry.stat.size };
    //        //fs.createReadStream(config.walkPath+'/'+entry.path)
    //        //    .pipe(new ID3())
    //        //    .on('data', function(tag){
    //        //        console.log( tag.type, tag.value );
    //        //    });
    //        fs.appendFile('out.txt', entry.fullPath + '\n', function (err) {
    //            if(err) console.error(err);
    //        });
    //    }))
    //    //.pipe(es.stringify())
    //    //.pipe(process.stdout);
    //    .on('end', function(){
    //        console.log('Writing to file finished');
    //        var myFiles = fs.readFileSync('out.txt').toString().split('\n');
    //        async.forEachSeries(myFiles, function(fullPath, callback) {
    //            var parser = mm(fs.createReadStream(fullPath), function (err, metadata) {
    //                if (err) throw err;
    //                console.log(metadata);
    //            });
    //            callback();
    //        }, function(err) {
    //            if (err) console.error('Error: ', err);
    //        });
    //    });

    //var array = fs.readFileSync('file.txt').toString().split("\n");

    //readdirp(
    //    { root: config.walkPath, fileFilter: '*.mp3' },
    //    function(fileInfo) {
    //        // do something with file entry here
    //    },
    //    function (err, res) {
    //        // all done, move on or do final step for all file entries here
    //    }
    //);



};

//TODO: Review the fields that are being updated
