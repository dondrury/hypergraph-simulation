require('dotenv').config()
const path = require('path')
const express = require('express')
const chalk = require('chalk')
const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const app = express()
const port = process.env.PORT

const reconnectAttemptDuration = 2000
let connector = {}
/* eslint-disable */
var connected = false
/* eslint-enable */

connect()
function connect () {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
    if (err) throw err
  })
}
mongoose.connection.on('connected', init)
function init () {
  console.log(chalk.green('Mongoose connected with URI'))
  clearInterval(connector)
  // console.log(chalk.green('Memcached connected with URI ' + process.env.MEMCACHED_URI))
}
mongoose.connection.on('disconnected', function () {
  console.log(chalk.red('Mongoose disconnected unexpectedly'))
  clearInterval(connector)
  connector = setInterval(connect, reconnectAttemptDuration)
  // process.exit(0)
})
// If the Node process ends, close the Mongoose connection, and the Mongosh connection
process.on('SIGINT', function () {
  Promise.all([mongoose.connection.close()]).then(() => {
    console.log(chalk.red('Mongoose disconnected through app termination'))
    process.exit(0)
  })
})
// If mongoose goes away, kill the process. It will bring itself back up and try again.
mongoose.connection.on('error', () => {
  mongoose.connection.close()
  console.log(chalk.red(' MongoDB connection error. Please make sure MongoDB is running.'))
  clearInterval(connector)
  connector = setInterval(connect, reconnectAttemptDuration)
})

app.set('views', 'views')
app.set('view engine', 'ejs')
app.enable('strict routing')
app.get('/', (req, res) => {
  res.render('layout', {})
})

var publicServeOptions = {
  dotfiles: 'ignore',
  etag: true,
  index: false,
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}
app.use('/', express.static(path.join(__dirname, 'public'), publicServeOptions))

app.listen(port, () => {
  console.log(`Hypergraph app listening at http://localhost:${port}`)
})
