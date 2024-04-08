const mongoose = require('mongoose')
const axios = require('axios')
const { getDistance, convertDistance } = require('geolib')
const Distance = require('../schemas')

const isValidUSAddress =(address) => {
    const usAddressRegex = /^(?=.*\b\d{5}\b)(?=.*\b[A-Z]{2}\b)(?=.*\b(?:\d+\s+)?(?:[A-Z]+\s+){0,3}[A-Z]+\b)(?!.*\bP\.\s*O\.\s*Box\b).*$/i;
    return usAddressRegex.test(address);
}

const calculateDistance = async (req, res) => {
  try {
    let distance
    const { sourceAddress, destinationAddress, unit } = req.body

    if (!sourceAddress || !destinationAddress) {
      console.log('No address provided')
      return res.status(400).send('Please provide source or destination address')
    }

    const onlySourceAddress = sourceAddress.replace(/\b(Suite|suite|apt|Apt|APT|Apartment|apartment|unit|Unit)\s*\d+\b/i, '')
    const onlyDestinationAddress = destinationAddress.replace(/\b(Suite|suite|apt|Apt|APT|Apartment|apartment|unit|Unit)\s*\d+\b/i, '')

    console.log(onlySourceAddress, onlyDestinationAddress)
    console.log(isValidUSAddress(onlySourceAddress), isValidUSAddress(onlyDestinationAddress))

    if (!isValidUSAddress(onlySourceAddress) || !isValidUSAddress(onlyDestinationAddress)) {
      console.log('Not a valid address')
      return res.status(400).send('Not a valid address')
    }

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
    // console.log(nominatimSourceResponse, nominatimDestinationResponse)

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
      return res.status(200).send(distance)
    }).catch((err) => {
      console.error(err)
      return res.status(500).send(`There was an error saving distance: ${err}`)
    })

  } catch (error) {
    console.error(error)
    return res.status(500).send(`There was an error: ${error}`)
  }
}

const getHistoricalQueries = async (req, res) => {
  try {
    const historicalQueriesAndDistances = await Distance.find({})

    return res.status(200).send(historicalQueriesAndDistances)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`There was an error: ${error}`)
  }
}

module.exports = {
  calculateDistance,
  getHistoricalQueries
}