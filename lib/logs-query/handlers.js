'use strict';

const Boom = require('boom');
const Promise = require('bluebird');
const merge = require('deepmerge');

module.exports = context => {
  const module = {
    getLogs,
    authenticate,
  };

  return module;

  function getLogs(request, reply) {
    const queryOpts = request.query;
    const queryAsync = Promise.promisify(request.logger.query, { context: request.logger });
    const defaultOptions = {
      from: new Date() - 24 * 60 * 60 * 1000,
      until: new Date(),
      limit: 10,
      start: 0,
      order: 'desc',
      fields: ['message'],
    };

    const options = merge(queryOpts || {}, defaultOptions);

    const promise = queryAsync(options).catch(err => {
      throw Boom.boomify(err);
    });

    reply(promise);
  }

  function authenticate(request, reply) {
    const { user, password } = context.authData;
    const { u, pwd } = request.payload;

    if (user === u && password === pwd) {
      return reply(context.authData);
    }

    return reply(Boom.unauthorized());
  }
};
