'use strict';

const jwt = require('jsonwebtoken');

const internals = {};

exports.register = function register(server, config) {
  // Define the 'jwt' strategy for authentication on the server.
  server.auth.strategy('query_jwt', 'jwt', {
    key: config.security.jwt.key,
    validateFunc: validate,
    verifyOptions: {
      algorithms: [config.security.jwt.algorithm],
    },
  });

  internals.config = config;
  server.ext(internals.generateTokenExtension);
};

exports.validateFn = validate;

internals.generateTokenExtension = {
  type: 'onPostHandler',
  method(request, response) {
    if (request.path === `${internals.config.path}/login`) {
      if (request.response.isBoom) {
        return response.continue();
      }

      const data = request.response.source;

      const issuedAt = new Date().getTime();
      const tokenClaims = {
        data,
        exp: issuedAt + internals.config.security.jwt.cookieOptions.ttl,
        iat: issuedAt,
      };

      const token = jwt.sign(tokenClaims, internals.config.security.jwt.key, {
        algorithm: internals.config.security.jwt.algorithm,
      });

      return response({
        token,
      })
        .header('Authorization', token)
        .state('token', token, internals.config.security.jwt.cookieOptions);
    }

    return response.continue();
  },
};

function validate(decoded, request, callback) {
  const currentTime = new Date().getTime();
  const { exp } = decoded;

  if (currentTime > exp) {
    return process.nextTick(() => callback(null, false));
  }

  return process.nextTick(() => callback(null, true));
}
