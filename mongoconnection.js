const mongoose = require('mongoose')

const uri = "mongodb+srv://jordanashment:RGKoM4u2Fjha32Ze@bain.jpvdyr9.mongodb.net/?retryWrites=true&w=majority&appName=Bain";

const dbConnection = () => mongoose.connect(uri).then(() => {
  console.log('MongoDB connected')
})

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

module.exports = dbConnection