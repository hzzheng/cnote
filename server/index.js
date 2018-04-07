const express = require('express')
const { exec } = require('child_process')

const app = express()

app.get('/', (req, res) => {
  res.send('hello, world!')
})

app.get('/post-receive', (req, res) => {
  exec('cd .. & git pull origin master & npm run build', (error, stdout) => {
    if (error) {
      console.error(`exec error: ${error}`); // eslint-disable-line 
      return;
    }
    console.log(`stdout: ${stdout}`); // eslint-disable-line 
  })
  res.send({
    ok: true
  })
})

app.listen(3000, () => {
  console.log('listening on port 3000'); // eslint-disable-line
})
