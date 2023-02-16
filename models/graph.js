const mongoose = require('mongoose')

const graphSchema = new mongoose.Schema({
  cartesian: { type: Array },
  size: { type: Number, required: true, index: true },
  connections: { type: Number, required: true, index: true }
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
  next()
})

/*
storySchema.pre('save', function (next) {
  if (!this.published) { this.published = new Date() }
  if (!this.updated) { this.updated = new Date() }
  this.urlName = this.title.replace(/[^a-zA-Z\d\s:]/g, '').replace(/[ ?/]/gi, '-').toLowerCase()
  if (!this.bodyVersions) this.bodyVersions = []
  this.bodyVersions.push({ date: new Date(), body: this.body })
  next()
})

storySchema.virtual('show').get(function () {
  if (this.public === false) return false
  if (!this.goLive || !this.expire) return true
  if (this.goLive.getTime() === this.expire.getTime()) return true
  if ((this.goLive.getTime() < Date.now()) && (Date.now() < this.expire.getTime())) {
    return true
  }
  return false
})

storySchema.virtual('link').get(function () {
  if (this.linkTo) return this.linkTo
  return `/story/${this._id}/${this.urlName}`
})

storySchema.methods.isLive = function () {
  if ((this.goLive.getTime() < Date.now()) && (Date.now() < this.expire.getTime())) {
    return true
  }
  return false
} */

const Graph = mongoose.model('Graph', graphSchema)

module.exports = Graph
