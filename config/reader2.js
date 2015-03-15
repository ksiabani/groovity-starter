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
    //mongoose = require('mongoose'),
    //Track = mongoose.model('Track'),
    //logger = require('../config/logger'),
    //md5 = require('MD5'),
    es = require('event-stream');

/**
 * Module init function.
 */
module.exports = function () {

    var stream = readdirp({ root: config.walkPath, fileFilter: '*.mp3' });
    stream
        .on('warn', function (err) {
            console.error('non-fatal error', err);
            // optionally call stream.destroy() here in order to abort and cause 'close' to be emitted
        })
        .on('error', function (err) { console.error('fatal error', err); })
        .pipe(es.mapSync(function (entry) {
            //return { path: entry.path, size: entry.stat.size };
            fs.createReadStream(config.walkPath+'/'+entry.path)
                .pipe(new ID3())
                .on('data', function(tag){
                    console.log( tag.type, tag.value );
                });
        }));
        //.pipe(es.stringify())
        //.pipe(process.stdout);
};

//TODO: Review the fields that are being updated
