const Graph = require('../models/graph')

exports.getGraph = (req, res) => {
  const id = req.query.id || req.params.id
  Graph.findById(id).exec((err, graph) => {
    if (err || !graph) {
      return res.render('layout', { title: 'Graph Not Found', view: '404' })
    }
    return res.render('layout', { title: 'Graph View ' + id, view: 'graph', graph })
  })
}

exports.newGraph = (req, res) => {
  const graph = new Graph({ size: 10 })
  graph.fillFalse()
  for (let i = 0; i < 50; i++) {
    graph.changeRandomConnection()
  }

  graph.save((err, g) => {
    if (err) {
      console.log(err)
      return
    }
    return res.render('layout', { title: 'Graph View ' + g.id, view: 'graph', graph })
  })
}

exports.nextGraph = (req, res) => {
  const id = req.query.id || req.params.id

  Graph.findById(id).exec((err, graph) => {
    if (err || !graph) {
      return res.render('layout', { title: 'Graph Not Found', view: '404' })
    }
    // graph.print()
    const newGraph = new Graph({
      adjascent: graph._id,
      cartesian: graph.cartesian,
      size: graph.size
    })
    while (newGraph.changeRandomConnection() === false) {
      // console.log();
    }
    newGraph.save((err, g) => {
      if (err) {
        console.log(err)
        return
      }
      return res.render('layout', { title: 'Graph View ' + newGraph.id, view: 'graph', graph: newGraph })
    })
  })
}
