const mongoose = require('mongoose')

const graphSchema = new mongoose.Schema({
  adjascent: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph' },
  cartesian: { type: Array },
  size: { type: Number, required: true, index: true }
  // density: { type: Number, required: true, index: true }
}, {
  // toObject: {
  //   virtuals: true
  // },
  // toJSON: {
  //   virtuals: true
  // },
  timestamps: true
})

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

function checkCompliance (attemptedCartesian) {
  const size = attemptedCartesian.length
  for (let i = 0; i < size; i++) { // rows
    let columnCount = 0
    for (let j = 0; j < size; j++) {
      columnCount += attemptedCartesian[i][j] ? 1 : 0 // count elements of column
    }
    if (columnCount > 3) return false
  }
  for (let j = 0; j < size; j++) { // columns
    let rowCount = 0
    for (let i = 0; i < size; i++) {
      rowCount += attemptedCartesian[i][j] ? 1 : 0 // count elements of column
    }
    if (rowCount > 3) return false
  }
  return true
}

graphSchema.pre('save', function (next) {
  next()
})

graphSchema.method('print', function () {
  // console.log(this.cartesian)
  for (let i = 0; i < this.size; i++) { // rows
    let s = ''
    for (let j = 0; j < this.size; j++) {
      s += (this.cartesian[i][j] ? 'X' : 'O')
    }
    console.log(s)
  }
  console.log('****end*******')
  return this
})

graphSchema.method('same', function (graph) {
  if (graph.size !== this.size) {
    console.log('not same size')
    return false
  }
  for (let i = 0; i < this.size; i++) { // rows
    for (let j = 0; j < this.size; j++) {
      if (this.cartesian[i][j] !== graph.cartesian[i][j]) return false
    }
  }
  return true
})

graphSchema.method('fillFalse', function () {
  const size = this.size
  this.cartesian = new Array(size)
  for (let i = 0; i < size; i++) {
    this.cartesian[i] = new Array(size).fill(false)
  }
  return this
})

graphSchema.method('changeRandomConnection', function () {
  const attemptedCartesian = JSON.parse(JSON.stringify(this.cartesian))
  const size = this.size
  const i = getRandomInt(size)
  const j = getRandomInt(size)
  if (i === j) return false

  attemptedCartesian[i][j] = !attemptedCartesian[i][j]
  attemptedCartesian[j][i] = !attemptedCartesian[j][i]
  // check for compaliance
  if (checkCompliance(attemptedCartesian)) {
    this.cartesian[i][j] = !this.cartesian[i][j]
    this.cartesian[j][i] = !this.cartesian[j][i]
    return true
  }
  return false
})

const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph
