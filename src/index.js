import http from 'http'

import connect from 'connect'
import bodyParser from 'body-parser'

process.env.PORT = process.env.PORT || '4444'

if (!process.env.HOOK_ROUTE) {
  throw new Error('HOOK_ROUTE must be set in the environment.')
}

const app = connect()
app.use(bodyParser.json())
app.post(`/${process.env.HOOK_ROUTE}`, (req, res) => {
  console.info('incoming webhook', req.method, req.url, req.headers)
  const postData = req.body
  if (postData) {
    console.info('RECEIVED:\n\n', postData)
  }
  res.end('OK\n')
})

const server = http.createServer(app)
server.on('error', err => console.error(err))
server.listen(process.env.PORT, err => {
  if (err) {
    console.error(err)
  }

  console.info('🌍  Listening on port %s', process.env.PORT)
})
