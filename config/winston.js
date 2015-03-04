'use strict';

var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            json: false,
            timestamp: true,
            colorize: true
        }),
        new winston.transports.File({
            name: 'info-file',
            filename: './app/logs/info.log',
            json: false,
            level: 'info'
        }),
        new winston.transports.File({
            name: 'error-file',
            filename: './app/logs/error.log',
            json: false,
            level: 'error'
        })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: false, timestamp: true }),
        new winston.transports.File({ filename: './app/logs/exceptions.log', json: false })
    ],
    exitOnError: false
});

module.exports = logger;

