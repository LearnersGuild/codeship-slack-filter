import http from 'http'

import express from 'express'
import bodyParser from 'body-parser'

process.env.PORT = process.env.PORT || '4444'

if (!process.env.HOOK_ROUTE) {
  throw new Error('HOOK_ROUTE must be set in the environment.')
}

const app = express()
app.use(bodyParser.json())
app.post(`/${process.env.HOOK_ROUTE}`, (req, res) => {
  console.info('incoming webhook', req.method, req.url, req.headers, req.query, req.body)
  const postData = req.body
  if (postData) {
  }
  res.status(200).send('OK\n')
})

const server = http.createServer(app)
server.on('error', err => console.error(err))
server.listen(process.env.PORT, err => {
  if (err) {
    console.error(err)
  }

  console.info('🌍  Listening on port %s', process.env.PORT)
})
