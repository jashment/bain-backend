const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const axios = require('axios')
const { getDistance, convertDistance } = require('geolib')

const app = express()

app.use(bodyParser.json())
app.use(cors())

app.post('/calculate-distance', async (req, res) => {
  try {
    let distance
    const { sourceAddress, destinationAddress, unit } = req.body

    const encodedSourceAddress = encodeURIComponent(sourceAddress)
    const encodedDestinationAddress = encodeURIComponent(destinationAddress)

    const nominatimSourceResponse = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodedSourceAddress}&format=json&limit=1`)
    const sourceCoordinates = {
      latitude: parseFloat(nominatimSourceResponse.data[0].lat),
      longitude: parseFloat(nominatimSourceResponse.data[0].lon)
    };

    const destinationResponse = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodedDestinationAddress}&format=json&limit=1`)
    const destinationCoordinates = {
      latitude: parseFloat(destinationResponse.data[0].lat),
      longitude: parseFloat(destinationResponse.data[0].lon)
    }

    const totalDistance = getDistance(sourceCoordinates, destinationCoordinates)
    if (unit === "both") {
      distance = { mi: convertDistance(totalDistance.toFixed(2), "mi").toFixed(2), km: convertDistance(totalDistance.toFixed(2), "km").toFixed(2) }
    } else {
      distance = { [unit]: convertDistance(totalDistance.toFixed(2), unit).toFixed(2) }
    }

    res.send(distance).status(200)
  } catch (error) {
    console.log(error)
    res.send(`There was an error: ${error}`).status(500)
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})