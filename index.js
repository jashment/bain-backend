const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const axios = require('axios')
const { getDistance, convertDistance } = require('geolib')
const Distance = require('./schemas')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@bain.jpvdyr9.mongodb.net/Bain?retryWrites=true&w=majority&appName=Bain`
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.post('/calculate-distance', async (req, res) => {
  try {
    let distance
    const { sourceAddress, destinationAddress, unit } = req.body

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

    mongoose.connect(uri).then(() => {
      console.log('MongoDB connected')
    })

    const distanceToSave = new Distance({
      sourceAddress,
      destinationAddress,
      distanceMiles: distance.mi,
      distanceKilometers: distance.km
    })
    
    await distanceToSave.save().then((saved) => {
      console.log('Distance saved', saved)
    }).catch((err) => {
      console.error(err)
    })

    res.send(distance).status(200)
  } catch (error) {
    console.error(error)
    res.send(`There was an error: ${error}`).status(500)
  }
})

app.get('/historical-queries', async (req, res) => {
  try {
    mongoose.connect(uri).then(() => {
      console.log('MongoDB connected')
    })
    const historicalQueriesAndDistances = await Distance.find({})

    res.send(historicalQueriesAndDistances).status(200)
  } catch (error) {
    console.error(error)
    res.send(`There was an error: ${error}`).status(500)
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})