const mongoose = require('mongoose')

const connectDB = () => {
  try {
    const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@bain.jpvdyr9.mongodb.net/Bain?retryWrites=true&w=majority&appName=Bain`
    const db = mongoose.connection

    db.on('error', console.error.bind(console, 'MongoDB connection error:'))

    mongoose.connect(uri).then(() => {
      console.log('MongoDB connected')
    })
  } catch (error) {
    console.error('Error connecting to MongoDB', error)
  }
}

module.exports = connectDB