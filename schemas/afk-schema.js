const mongoose = require('mongoose')

const afkSchema = mongoose.Schema({ 
    guildId: { 
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    afk: {
        type: String,
        required: true
    },
    timestamp: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('afk', afkSchema)