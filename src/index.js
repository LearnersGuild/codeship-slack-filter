import http from 'http'

import express from 'express'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'

process.env.PORT = process.env.PORT || '4444'

if (!process.env.HOOK_ROUTE) {
  throw new Error('HOOK_ROUTE must be set in the environment.')
}
if (!process.env.SLACK_CODESHIP_WEBHOOK_URL) {
  throw new Error('SLACK_CODESHIP_WEBHOOK_URL must be set in the environment.')
}

// cache the build status for next time (imperfect, but fine for now)
// won't work between restarts -- should use redis instead
const projectBuildStatusMap = {}

function humanStatus(status) {
  /* eslint-disable camelcase */
  const statusMap = {
    success: 'succeeded',
    error: 'failed',
    stopped: 'stopped',
    ignored: 'could not run -- over monthly build limit',
    blocked: 'could not run -- too many resources being consumed',
    infrastructure_failure: 'could not run -- Codeship error',
  }
  return statusMap[status] || 'status unknown'
}

function colorForStatus(status) {
  const red = '#f1412c'
  const green = '#009900'
  const grey = '#cccccc'
  const colorMap = {
    success: green,
    error: red,
    stopped: grey,
    ignored: red,
    blocked: red,
    infrastructure_failure: red,
  }
  return colorMap[status] || grey
}

function shouldBePosted(body) {
  const {build} = body
  if (!build) {
    console.log('no "build" attribute found in body, not posting')
    return false
  }
  /* eslint-disable camelcase */
  const {
    branch,
    project_name,
    status,
  } = build
  if (branch !== 'master') {
    console.log('not on "master" branch, not posting')
    return false
  }
  if (status === 'stopped' || status === 'waiting') {
    console.log(`status is "${status}", not posting`)
    return false
  }
  if (status === 'success' && projectBuildStatusMap[project_name] !== 'error') {
    console.log(`status is "${status}" and last build for this project was not an error, not posting`)
    return false
  }
  projectBuildStatusMap[project_name] = status
  return true
}

function slackMessage(body) {
  const {
    build: {
      branch,
      message,
      project_name,
      committer,
      commit_url,
      status,
    }
  } = body

  return {
    attachments: [{
      color: colorForStatus(status),
      fields: [{
        title: `Build ${humanStatus(status)}`,
        value: `<${commit_url}|${message}>`,
        short: true,
      }, {
        title: 'Committer',
        value: committer,
        short: true,
      }, {
        title: 'Branch',
        value: branch,
        short: true,
      }, {
        title: 'Project',
        value: project_name,
        short: true,
      }],
    }],
  }
}

const app = express()
app.use(bodyParser.json())
app.post(`/${process.env.HOOK_ROUTE}`, (req, res) => {
  console.info('incoming webhook', req.method, req.url) // , req.headers, req.query, req.body)
  console.info('body:', req.body)
  if (shouldBePosted(req.body)) {
    return fetch(process.env.SLACK_CODESHIP_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage(req.body)),
    }).then(resp => {
      if (!resp.ok) {
        return res.status(resp.status).send(resp.body.read())
      }
      return res.status(200).send(resp.body.read())
    })
  }
  return res.status(500).send('Missing Body')
})

const server = http.createServer(app)
server.on('error', err => console.error(err))
server.listen(process.env.PORT, err => {
  if (err) {
    console.error(err)
  }

  console.info('🌍  Listening on port %s', process.env.PORT)
})
