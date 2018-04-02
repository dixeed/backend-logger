# What is it ?
This package is just a wrapper arround [winston](https://github.com/winstonjs/winston) plugin in order to make a `Logger` object available within a _Hapi_ application.

# How to use it ?
This plugin decorates the `request` object with a _logger_ property making the winston logger accessible within a handler.

So basically you can just go like:
```javascript
function myHandler(request, reply) {
  // Your code.
  request.logger.debug('This is my debug info');
  
  // ...
  .catch(err => {
    request.logger.error('This is an error');
  });
}
```

## Winston API
You can read in detail what does the winston API offer on the [github page](https://github.com/winstonjs/winston).

Here is a small preview of the methods you can use in order to log:
* `log({ level: 'info', message: 'message' })`
* `debug('my debug message')`
* `info('my info message')`
* `warn('my warning message')`
* `error('my error message')`

## Logger Configuration
```javascript
{
  level: 'debug' // 'silly', 'debug', 'verbose', 'info', 'warn', 'error',
  fileLogger: {
    filename: 'my-log-file.log',
    logDirectory: 'logs/',
    datePattern: 'yyyy-MM-dd.',
    prepend: 'true',
    zippedArchive: true,
    maxDays: 7,
  },
}
```

The `level` option is used to filter the logs you want to print. If you want, for example to put your in production but limit the logs to warn level, you can modify this config instead of removing your logs.

# Query logs
You can choose to activate an API on your application to query the logs with a standard HTTP _GET_ request. The response is in __JSON__.

_Coming soon_
