const mongoose = require('mongoose')

const statusStates = [ 'sent', 'in progress...', 'closed']
const typeStates = ['השחרה', 'כניסה-רגלי', 'כניסה-רכוב', 'קידוד חוגר', 'שו"ס',  ]

const requestSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        // required: true
    },
    status: {
        type: String,
        enum: statusStates,
        // required: true
    },
    isValid:{
        type: Boolean,
        // required: true,
        default: false
    },
    type: {
        type: String,
        enum: typeStates,
        // required: true
    },
    reasonIfNeeded:{
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: 'User'
    }
}, {timestamps: true})

const Request = mongoose.model('request', requestSchema)

module.exports = Request