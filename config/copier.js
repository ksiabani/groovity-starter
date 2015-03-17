'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    config = require('../config/config'),
    Track = require('mongoose').model('Track'),
    logger = require('../config/logger'),
    id3 = require('id3_reader'),
    mm= require('musicmetadata'),
    md5 = require('MD5');

/**
 * Define copier
 */
var copier = function() {
    Track.find({ copied: false }, {source: 1, cover: 1}).exec( function(err, tracks) {
        if (err) logger.error(err);
        JSON.parse(JSON.stringify(tracks)).forEach(function(track) {

           fs.readFile(track.source_path, function(err, buffer) {
               if (err) logger.error(err);
               id3.read(buffer, function(err, meta) {
                   if (err) logger.error(err);
                   var destFile = config.destPath + meta.album.replace(/ /g, '_') + '-' + meta.artist.replace(/ /g,'_') + '-' + meta.title.replace(/ /g,'_') + '.mp3';
                   fs.writeFile(destFile, buffer, function (err) {
                       if (err) logger.error(err);
                       logger.info('Copying file ' + destFile + ' to ' + config.destPath);
                       var parser = mm(fs.createReadStream(track.source_path), function (err, meta) {
                           if (err) logger.error(err);
                           fs.writeFile(config.destPath + '/' + track.cover + '.' + meta.picture[0].format, meta.picture[0].data, function(err){
                               if (err) logger.error(err);
                               Track.update({source_path: track.source_path}, {copied: true}).exec(function(err, tracks){
                                   if (err) logger.error(err);
                                   logger.info('File was copied and art extracted.');
                               });
                           });
                       });
                   });
               });
           });
       });
    });
};
/**
 * Export copier
 */
module.exports = copier;


