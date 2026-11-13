
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    body: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    status: {
        type: String,
        required: true
    },
    errors: {
        type: [String],
        default: []
    },
    state: {
        type: String
    },
    stateHistory: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Request", requestSchema);
