'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    config = require('../config/config'),
    Track = require('mongoose').model('Track'),
    logger = require('../config/winston'),
    id3 = require('id3_reader');

/**
 * Define copier
 */
var copier = function() {
    Track.find({ approved: false, copied: false }, {source_path:1, _id:0}).exec( function(err, tracks) {
        if (err) logger.error(err);
        JSON.parse(JSON.stringify(tracks)).forEach(function(filePath) {
           var myfile =JSON.stringify(filePath).substring(16).replace('"}','');
           fs.readFile(myfile, function(err, buffer) {
               if (err) logger.error(err);
               id3.read(buffer, function(err, meta) {
                   if (err) logger.error(err);
                   var destFile = config.destPath + meta.album.replace(/ /g, '_') + '-' + meta.artist.replace(/ /g,'_') + '-' + meta.title.replace(/ /g,'_') + '.mp3';
                   fs.writeFile(destFile, buffer, function (err) {
                       if (err) logger.error(err);
                       logger.info('Copying file ' + destFile + ' to ' + config.destPath);
                       Track.update({source_path: filePath}, {dest_path: config.destPath}).exec(function(err, tracks){
                           if (err) logger.error(err);
                           logger.info('Destination path updated');
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
