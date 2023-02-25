require('dotenv').config()
const path = require('path')
const express = require('express')
const chalk = require('chalk')
const mongoose = require('mongoose')
const graphController = require('./controllers/graph')
const atomicVectors = require('./models/atomicVectors')
mongoose.set('strictQuery', true)
const app = express()

const reconnectAttemptDuration = 2000
let connector = {}
/* eslint-disable */
var connected = false
/* eslint-enable */
// atomicVectors.scale(4)
atomicVectors.init()
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
app.get('/', graphController.home)
app.get('/graph/byId', graphController.getGraph)
app.get('/graph/new', graphController.newGraph)
app.get('/graph/:id', graphController.getGraph)
// app.get('/graph/next/:id', graphController.nextGraph)

const publicServeOptions = {
  dotfiles: 'ignore',
  etag: true,
  index: false,
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}
app.use('/', express.static(path.join(__dirname, 'public'), publicServeOptions))

app.get('*', (req, res) => { // if page is left unspecified, this will direct to 404
  res.status(404).render('layout', { title: 'Sorry Not Found', view: '404' })
})
app.listen(process.env.PORT, () => {
  console.log(`Hypergraph app listening at http://localhost:${process.env.PORT}`)
})
