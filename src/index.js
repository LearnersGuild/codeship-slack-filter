import http from 'http'

import connect from 'connect'
import bodyParser from 'body-parser'

process.env.PORT = process.env.PORT || '4444'

const format = input => JSON.stringify(input, null, 2)

const app = connect()
app.use(bodyParser.json())
app.use((req, res) => {
  console.info('incoming webhook', req.method, req.url)
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
