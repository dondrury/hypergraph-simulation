const Graph = require('../models/graph')
const atomicVectorsModel = require('../models/atomicVectors')
const atomicVectors = atomicVectorsModel.all()

exports.getGraph = (req, res) => {
  const id = req.query.id || req.params.id
  Graph.findById(id).exec((err, graph) => {
    if (err || !graph) {
      return res.render('layout', { title: 'Graph Not Found', view: '303' })
    }
    return res.render('layout', { title: 'Graph View ' + id, view: 'graph', graph })
  })
}

exports.newGraph = (req, res) => {
  const graph = new Graph({ size: 15 })
  graph.fillFalse()
  //
  // graph.saturate()
  graph.fill([7, 11, 13])
  graph.print()
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
      return res.render('layout', { title: 'Graph Not Found', view: '303' })
    }
    const newGraph = new Graph({
      adjascent: graph._id,
      cartesian: graph.cartesian,
      size: graph.size
    })
    // while (newGraph.changeRandomConnection() === false) {
    //   // console.log();
    // }
    newGraph.next()
    // console.log(newGraph.ordinality());
    newGraph.save((err, g) => {
      if (err) {
        console.log(err)
        return
      }
      return res.render('layout', { title: 'Graph View ' + newGraph.id, view: 'graph', graph: newGraph })
    })
  })
}
