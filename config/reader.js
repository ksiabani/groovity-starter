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
    async = require('async'),
    S = require('string');

/**
 * Module init function.
 */
module.exports = function () {
    logger.info('Reading source folder', config.walkPath, 'for mp3 files');
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
        logger.info('Reading source folder finished,', myFiles.length, 'files found');

        async.eachSeries(myFiles, function(file, callback) {
            logger.info('Processing file ' + file);
            var meta = { cover:{} };
            var stream = fs.createReadStream(file);
            stream
                .pipe(new ID3())
                .on('data', function(tag){
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
                    logger.info('Finished reading metadata');
                    stream.destroy();
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
                            if (err) logger.error('Error while storing metadata for file', file, '\n', err);
                        });
                    callback();
                });

        }, function(err){
            if( err ) {
                logger.error('Error while processing a file', '\n', err);
            } else {
                logger.info('All files have been processed successfully');
            }
        });
    });
};

//TODO: Review the fields that are being updated
