'use strict';

/**
 * Module dependencies.
 */
var config = require('../config/config'),
    logger = require('../config/logger'),
    mailer = require('../config/mailer'),
    child_process = require('child_process'),
    execFile = require('child_process').execFile;

/**
 * Module init function.
 */
module.exports = function () {

    //wget -r -m -nH --cut-dirs=1 -P /volume1/RaiNAS/music/offline "ftp://KONSTANTINOS SIABANIS:p8Pm7I@private.feelmusic.cc/Essential_House/2015/*"
    var wget = execFile('wget', [
        '-nv', //no-verbose output
        '-r',
        '-m',   //mirror
        '-nH',
        '--cut-dirs=1',
        '-P',
        config.downPath,
        'ftp://KONSTANTINOS SIABANIS:p8Pm7I@private.feelmusic.cc/Essential_House/2015/*'
    ]);

    wget.stdout.on('data', function (data) {
        logger.info(data.toString());
    });

    wget.stderr.on('data', function (data) {
        logger.info(data.toString());
    });

    wget.on('close', function (code) {
        mailer('GS: Downloader exited with code ' + code);
    });

};
