'use strict';

const winston = require('winston');
require('winston-daily-rotate-file');
const Joi = require('joi');
const merge = require('deepmerge');
const { mkdir } = require('fs');
const { join } = require('path');

const auth = require('./lib/auth-jwt');
const logsQuery = require('./lib/logs-query');
const pkg = require('./package.json');
const Schema = require('./validate');

const defaultLogPath = join(process.cwd(), 'logs');
const defaultOptions = {
  level: 'debug',
  fileLogger: {
    logDirectory: defaultLogPath,
    filename: 'app.log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    zippedArchive: true,
    maxDays: 7,
  },
  queryApi: {
    active: false,
    path: '/query-logs',
    user: 'query_user',
    password: 'password',
    security: {
      jwt: {
        algorithm: 'HS512',
        cookieOptions: {
          ttl: 1000 * 60 * 60 * 6, // valid for 6 hours
          isSecure: true,
          isHttpOnly: true,
          encoding: 'none',
          clearInvalid: false,
          strictHeader: true,
        },
      },
    },
  },
};

exports.register = (server, options, next) => {
  let opts = {};
  if (typeof options !== 'undefined') {
    opts = options;
  }

  const validation = Joi.validate(opts, Schema.options);

  if (!validation || validation.error) {
    throw validation.error;
  }

  const mergedOpts = merge(defaultOptions, opts || {});
  mergedOpts.fileLogger.timestamp = () => new Date().toString();

  if (mergedOpts.queryApi.active) {
    auth.register(server, mergedOpts.queryApi);
    logsQuery.register(server, mergedOpts.queryApi);
  }

  // Create the log directory.
  mkdir(mergedOpts.fileLogger.logDirectory, err => {
    if (err) {
      // We ignore the error of existing dir.
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }

    mergedOpts.fileLogger.filename = join(
      mergedOpts.fileLogger.logDirectory,
      mergedOpts.fileLogger.filename
    );

    const logger = new winston.Logger({
      level: opts.level || defaultOptions.level,
      transports: [
        new winston.transports.Console({
          timestamp() {
            return new Date().toString();
          },
        }),
        new winston.transports.DailyRotateFile(mergedOpts.fileLogger),
      ],
    });

    server.decorate('request', 'logger', logger);

    next();
  });
};

exports.register.attributes = {
  pkg,
};
