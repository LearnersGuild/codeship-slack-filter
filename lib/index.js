'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.env.PORT = process.env.PORT || '4444';

if (!process.env.HOOK_ROUTE) {
  throw new Error('HOOK_ROUTE must be set in the environment.');
}
if (!process.env.SLACK_CODESHIP_WEBHOOK_URL) {
  throw new Error('SLACK_CODESHIP_WEBHOOK_URL must be set in the environment.');
}

// cache the build status for next time (imperfect, but fine for now)
// won't work between restarts -- should use redis instead
var projectBuildStatusMap = {};

function humanStatus(status) {
  /* eslint-disable camelcase */
  var statusMap = {
    success: 'succeeded',
    error: 'failed',
    stopped: 'stopped',
    ignored: 'could not run -- over monthly build limit',
    blocked: 'could not run -- too many resources being consumed',
    infrastructure_failure: 'could not run -- Codeship error'
  };
  return statusMap[status] || 'status unknown';
}

function colorForStatus(status) {
  var red = '#f1412c';
  var green = '#009900';
  var grey = '#cccccc';
  var colorMap = {
    success: green,
    error: red,
    stopped: grey,
    ignored: red,
    blocked: red,
    infrastructure_failure: red
  };
  return colorMap[status] || grey;
}

function shouldBePosted(body) {
  var build = body.build;

  if (!build) {
    console.log('no "build" attribute found in body, not posting');
    return false;
  }
  /* eslint-disable camelcase */
  var branch = build.branch;
  var project_name = build.project_name;
  var status = build.status;

  if (branch !== 'master') {
    console.log('not on "master" branch, not posting');
    return false;
  }
  if (status === 'stopped' || status === 'waiting') {
    console.log('status is "' + status + '", not posting');
    return false;
  }
  if (status === 'success' && projectBuildStatusMap[project_name] !== 'error') {
    console.log('status is "' + status + '" and last build for this project was not an error, not posting');
    return false;
  }
  projectBuildStatusMap[project_name] = status;
  return true;
}

function slackMessage(body) {
  var _body$build = body.build;
  var branch = _body$build.branch;
  var message = _body$build.message;
  var project_name = _body$build.project_name;
  var committer = _body$build.committer;
  var commit_url = _body$build.commit_url;
  var status = _body$build.status;


  return {
    attachments: [{
      color: colorForStatus(status),
      fields: [{
        title: 'Build ' + humanStatus(status),
        value: '<' + commit_url + '|' + message + '>',
        short: true
      }, {
        title: 'Committer',
        value: committer,
        short: true
      }, {
        title: 'Branch',
        value: branch,
        short: true
      }, {
        title: 'Project',
        value: project_name,
        short: true
      }]
    }]
  };
}

var app = (0, _express2.default)();
app.use(_bodyParser2.default.json());
app.post('/' + process.env.HOOK_ROUTE, function (req, res) {
  console.info('incoming webhook', req.method, req.url); // , req.headers, req.query, req.body)
  console.info('body:', req.body);
  if (shouldBePosted(req.body)) {
    return (0, _nodeFetch2.default)(process.env.SLACK_CODESHIP_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackMessage(req.body))
    }).then(function (resp) {
      if (!resp.ok) {
        return res.status(resp.status).send(resp.body.read());
      }
      return res.status(200).send(resp.body.read());
    });
  }
  return res.status(500).send('Missing Body');
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