const Graph = require('../models/graph')

exports.getGraph = (req, res) => {
  // console.log(req.query);
  const id = req.query.id || req.params.id
  // console.log(id);
  Graph.findById(id).exec((err, graph) => {
    if (err || !graph) {
      return res.render('layout', { title: 'Graph Not Found', view: '404' })
    }
    return res.render('layout', { title: 'Graph View ' + id, view: 'graph' })
  })
}
