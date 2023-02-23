const mongoose = require('mongoose')
const atomicVectorsModel = require('../models/atomicVectors')
const atomicVectors = atomicVectorsModel.all()

const graphSchema = new mongoose.Schema({
  adjascent: { type: mongoose.Schema.Types.ObjectId, ref: 'Graph' },
  cartesian: { type: Array },
  size: { type: Number, required: true, index: true }
  // density: { type: Number, required: true, index: true }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
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
    if (columnCount > 2) return false
  }
  // for (let j = 0; j < size; j++) { // columns
  //   let rowCount = 0
  //   for (let i = 0; i < size; i++) {
  //     rowCount += attemptedCartesian[i][j] ? 1 : 0 // count elements of column
  //   }
  //   if (rowCount > 2) return false
  // }
  return true
}

graphSchema.pre('save', function (next) {
  next()
})

graphSchema.method('print', function () {
  console.log(this.id)
  for (let i = 0; i < this.size; i++) { // rows
    let s = ''
    for (let j = 0; j < this.size; j++) {
      s += (this.cartesian[i][j] ? '◉ ' : '◯ ')
    }
    console.log(s)
  }
  // console.log('****end*******')
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

graphSchema.method('ordinality', function () {
  const size = this.size
  let edges = 0
  for (let i = 0; i < size; i++) { // rows
    let columnCount = 0
    for (let j = 0; j < size; j++) {
      columnCount += this.cartesian[i][j] ? 1 : 0 // count elements of column
    }
    edges += columnCount
  }
  return edges / size
})

graphSchema.method('saturate', function () {
  while (this.ordinality() < 2) {
    this.print()
    this.addEdge()
  }
})

// graphSchema.method('next', function () { // remove element, try again
//   // if (this.ordinality() === 2) {
//   //   // this.print()
//   //   while (this.addEdge() === false) {
//   //     // this.print()
//   //   }
//   // }
//   // this.print()
//   // this.saturate()
//   // console.log('SATURATED');
//   // this.print()
// })

graphSchema.method('fill', function (vectorFill) { // atomicVectors = [7, 11, 13]
  if (vectorFill.length % 2 !== 0) {
    console.log('Odd number length for atomicVectors')
  }
  for (let i = 0; i < vectorFill.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(atomicVectors, vectorFill[i])) {
      console.log('Unknown atomicVector ' + vectorFill[i])
    }
    const v = atomicVectors[vectorFill[i]]
    console.log(v);
  }
  return this
})

graphSchema.method('fillFalse', function () {
  const size = this.size
  this.cartesian = new Array(size)
  for (let i = 0; i < size; i++) {
    this.cartesian[i] = new Array(size).fill(false)
  }
  return this
})

graphSchema.method('fillIdentity', function () {
  const size = this.size
  this.cartesian = new Array(size)
  for (let i = 0; i < size; i++) {
    this.cartesian[i] = new Array(size).fill(false)
    this.cartesian[i][i] = true
  }
  return this
})

// graphSchema.method('createSpace', function () {
//   const size = this.size
//   this.cartesian = new Array(size)
//   for (let i = 0; i < size; i++) {
//     this.cartesian[i] = new Array(size).fill(false)
//     for (let j = 0; j < size; j++) {
//       if (j - i <= 2 && i - j <= 2) this.cartesian[i][j] = true
//       if (i === j) this.cartesian[i][j] = false
//     }
//   }
//   return this
// })

graphSchema.method('addEdge', function () {
  const attemptedCartesian = JSON.parse(JSON.stringify(this.cartesian))
  const size = this.size
  const i = getRandomInt(size)
  const j = getRandomInt(size)
  if (i === j) return false

  attemptedCartesian[i][j] = true
  attemptedCartesian[j][i] = true
  // check for compaliance
  if (checkCompliance(attemptedCartesian)) {
    this.cartesian[i][j] = true
    this.cartesian[j][i] = true
    return true
  }
  return false
})

const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph
