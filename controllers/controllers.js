const mongoose = require('mongoose')
const axios = require('axios')
const { getDistance, convertDistance } = require('geolib')
const Distance = require('../schemas')

const calculateDistance = async (req, res) => {
  try {
    let distance
    const { sourceAddress, destinationAddress, unit } = req.body

    if (!sourceAddress || !destinationAddress) {
      console.log('No address provided')
      return res.send('Please provide source or destination address').status(400)
    }

    const onlySourceAddress = sourceAddress.replace(/\b(Suite|suite|apt|Apt|APT|Apartment|apartment|unit|Unit)\s*\d+\b/i, '')
    const onlyDestinationAddress = destinationAddress.replace(/\b(Suite|suite|apt|Apt|APT|Apartment|apartment|unit|Unit)\s*\d+\b/i, '')

    const encodedSourceAddress = encodeURIComponent(onlySourceAddress)
    const encodedDestinationAddress = encodeURIComponent(onlyDestinationAddress)

    const nominatimSourceResponse = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodedSourceAddress}&format=json&limit=1`)
    const sourceCoordinates = {
      latitude: parseFloat(nominatimSourceResponse.data[0].lat),
      longitude: parseFloat(nominatimSourceResponse.data[0].lon)
    };

    const nominatimDestinationResponse = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodedDestinationAddress}&format=json&limit=1`)
    const destinationCoordinates = {
      latitude: parseFloat(nominatimDestinationResponse.data[0].lat),
      longitude: parseFloat(nominatimDestinationResponse.data[0].lon)
    }

    const totalDistance = getDistance(sourceCoordinates, destinationCoordinates)
    if (unit === "both") {
      distance = { mi: convertDistance(totalDistance.toFixed(2), "mi").toFixed(2), km: convertDistance(totalDistance.toFixed(2), "km").toFixed(2) }
    } else {
      distance = { [unit]: convertDistance(totalDistance.toFixed(2), unit).toFixed(2) }
    }

    const distanceToSave = new Distance({
      sourceAddress,
      destinationAddress,
      distanceMiles: distance.mi,
      distanceKilometers: distance.km
    })
    
    await distanceToSave.save().then((saved) => {
      console.log('Distance saved', saved)
      return res.send(distance).status(200)
    }).catch((err) => {
      console.error(err)
      return res.send(`There was an error saving distance: ${err}`).status(500)
    })

  } catch (error) {
    console.error(error)
    return res.send(`There was an error: ${error}`).status(500)
  }
}

const getHistoricalQueries = async (req, res) => {
  try {
    const historicalQueriesAndDistances = await Distance.find({})

    return res.send(historicalQueriesAndDistances).status(200)
  } catch (error) {
    console.error(error)
    return res.send(`There was an error: ${error}`).status(500)
  }
}

module.exports = {
  calculateDistance,
  getHistoricalQueries
}