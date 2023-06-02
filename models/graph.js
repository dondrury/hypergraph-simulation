const mongoose = require('mongoose')
const Library = require('../js/library')
const graphSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  maxScale: {type: Number },
  notes: { type: String }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  timestamps: true
})



graphSchema.pre('save', function (next) {
  console.log('this', this)
  const complianceVector = Library.validateVectorString(this.name)
  if (complianceVector.includes(false)) {
    next(new Error('Graph is not compliant'));
  } else {
    next()
  }
})

const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph
