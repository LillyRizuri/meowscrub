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
        required: true
    },
    pingCount: {
        type: Number,
        required: true,
        default: 0
    },
    username: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('afk', afkSchema)