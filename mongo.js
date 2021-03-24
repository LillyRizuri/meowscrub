require('dotenv').config()

const mongoose = require('mongoose')
const mongoPath = process.env.MONGO

// const mongoPath = 'mongodb://localhost:27017'

module.exports = async () => {
    await mongoose.connect(mongoPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
}