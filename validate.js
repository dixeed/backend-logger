'use strict';

const Joi = require('joi');

const options = Joi.object().keys({
  level: Joi.string().valid('silly', 'debug', 'verbose', 'info', 'warn', 'error'),
  fileLogger: Joi.object().keys({
    filename: Joi.string(),
    logDirectory: Joi.string(),
    datePattern: Joi.string(),
    prepend: Joi.boolean(),
    zippedArchive: Joi.boolean(),
    maxDays: Joi.number()
      .integer()
      .min(0),
  }),
  queryApi: Joi.object().keys({
    active: Joi.boolean(),
    path: Joi.string().uri({
      allowRelative: true,
      relativeOnly: true,
    }),
    user: Joi.string().min(3),
    password: Joi.string().min(5),
    security: Joi.object()
      .keys({
        jwt: Joi.object()
          .keys({
            key: Joi.string().required(),
            algorithm: Joi.string().valid(
              'HS256',
              'HS384',
              'HS512',
              'RS256',
              'RS384',
              'RS512',
              'ES256',
              'ES384',
              'ES512',
              'none'
            ),
            cookieOptions: Joi.object().keys({
              ttl: Joi.number()
                .integer()
                .min(0),
              isSecure: Joi.boolean(),
              isHttpOnly: Joi.boolean(),
              encoding: Joi.string(),
              clearInvalid: Joi.boolean(),
              strictHeader: Joi.boolean(),
            }),
          })
          .required(),
      })
      .required(),
  }),
});

const authData = Joi.object().keys({
  u: Joi.string()
    .min(3)
    .required(),
  pwd: Joi.string()
    .min(5)
    .required(),
});

const queryOptions = Joi.object().keys({
  from: Joi.date().max(Joi.ref('until')),
  until: Joi.date(),
  limit: Joi.number()
    .integer()
    .positive(),
  start: Joi.number().integer(),
  order: Joi.string().valid('desc', 'asc'),
  fields: Joi.array().items(Joi.string().required()),
});

module.exports = {
  options,
  authData,
  queryOptions,
};
