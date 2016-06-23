'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.PORT = process.env.PORT || '4444';

if (!process.env.HOOK_ROUTE) {
  throw new Error('HOOK_ROUTE must be set in the environment.');
}

var app = (0, _express2.default)();
app.use(_bodyParser2.default.json());
app.post('/' + process.env.HOOK_ROUTE, function (req, res) {
  console.info('incoming webhook', req.method, req.url, req.headers, req.query, req.body);
  var postData = req.body;
  if (postData) {}
  res.status(200).send('OK\n');
});

var server = _http2.default.createServer(app);
server.on('error', function (err) {
  return console.error(err);
});
server.listen(process.env.PORT, function (err) {
  if (err) {
    console.error(err);
  }

  console.info('🌍  Listening on port %s', process.env.PORT);
});