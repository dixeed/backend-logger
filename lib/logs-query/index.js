'use strict';

const handlersFn = require('./handlers');
const validate = require('../../validate');

exports.register = (server, options) => {
  const handlers = handlersFn({
    authData: {
      user: options.user,
      password: options.password,
    },
  });

  server.route([
    {
      method: 'GET',
      path: options.path,
      handler: handlers.getLogs,
      config: {
        auth: 'query_jwt',
        validate: {
          query: validate.queryOptions,
        },
      },
    },
    {
      method: 'POST',
      path: `${options.path}/login`,
      handler: handlers.authenticate,
      config: {
        auth: false,
        validate: {
          payload: validate.authData,
        },
      },
    },
  ]);
};

exports.register.attributes = {
  name: 'LogsQueryPlugin',
  version: '1.0.0',
};
