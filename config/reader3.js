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
    mongoose = require('mongoose'),
    Track = mongoose.model('Track'),
    logger = require('../config/logger'),
    md5 = require('MD5'),
    //es = require('event-stream'),
    async = require('async'),
    S = require('string');

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
            var meta = { cover:{} };
            //id3v1/v2
            var stream = fs.createReadStream(file);

            stream
                .pipe(new ID3())
                .on('data', function(tag){
                    //console.log(tag);
                    if(tag.type === 'TPE1'){ meta.artist = tag.value; }
                    if(tag.type === 'TALB'){ meta.album = tag.value; }
                    if(tag.type === 'TIT2'){ meta.title = tag.value; }
                    if(tag.type === 'TYER'){ meta.year = tag.value; }
                    if(tag.type === 'TCON'){ meta.genre = tag.value; }
                    if(tag.type === 'TPUB'){ meta.publisher = tag.value; }
                    if(tag.type === 'APIC'){
                        meta.cover.mime = S(tag.value.mime).chompLeft('image/').s;
                    }
                    if(tag.type === 'APIC'){ meta.cover.type = tag.value.type; }
                    if(tag.type === 'APIC'){ meta.cover.data = tag.value.data; }
                    if(meta.cover.mime){ meta.cover.name = md5(meta.artist + meta.album + meta.publisher) + '.' + meta.cover.mime;}
                    if(tag.type === 'TXXX' && S(tag.value).left(9).s === 'Rip date/' ){
                        meta.released = S(tag.value).chompLeft('Rip date/').s;
                    }
                })
                .on('end', function(){
                    console.log(meta);
                    console.log( 'the end' );
                    stream.destroy();
                    //if(!meta.cover) {
                    //    var cover = md5(meta.artist + meta.album + meta.publisher) + '.' + meta.cover.type;
                    //}
                    Track.findOneAndUpdate(
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
                                cover: meta.cover.name || null,
                                source: file,
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
                    callback();
                });


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
