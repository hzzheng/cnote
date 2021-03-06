/* eslint-disable */
const express = require('express')
const { exec } = require('child_process')

const app = express()

app.get('/', (req, res) => {
  res.send('hello, world!')
})

app.post('/api/static-receive', (req, res) => {
  exec('cd /usr/local/public & git pull origin master', (error, stdout) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  })
  res.send({
    ok: true
  })
})

app.post('/api/post-receive', (req, res) => {
  exec('cd .. & git pull origin master & npm run build', (error, stdout) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  })
  res.send({
    ok: true
  })
})

app.listen(3000, () => {
  console.log('listening on port 3000');
})
