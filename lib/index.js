'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _connect = require('connect');

var _connect2 = _interopRequireDefault(_connect);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.PORT = process.env.PORT || '4444';

var format = function format(input) {
  return JSON.stringify(input, null, 2);
};

var app = (0, _connect2.default)();
app.use(_bodyParser2.default.json());
app.use(function (req, res) {
  console.info('incoming webhook', req.method, req.url);
  var postData = req.body;
  if (postData) {
    console.info('RECEIVED:\n\n', postData);
  }
  res.end('OK\n');
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