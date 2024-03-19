const mongoose = require('mongoose')

const distanceSchema = new mongoose.Schema({
  sourceAddress: {
    type: String,
    required: true
  },
  destinationAddress: {
    type: String,
    required: true
  },
  distanceMiles: {
    type: Number,
    required: false
  },
  distanceKilometers: {
    type: Number,
    required: false
  }
})

module.exports = mongoose.model('Distance', distanceSchema)