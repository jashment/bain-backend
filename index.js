const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const routes = require('./routes/routes')
const dotenv = require('dotenv')
const connectDB = require('./mongoConnection')

dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(cors())

connectDB()

app.use('/', routes)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})