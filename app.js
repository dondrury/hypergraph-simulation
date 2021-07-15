require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT
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
