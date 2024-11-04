const mongoose = require('mongoose');

//Scramble Order
const ScrambleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    targetSystem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StarSystem',
        required: true
    },
    targetPlanet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Planet',
        required: true
    },
    targetMoon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Moon',
        required: true
    },
    notes: {
        type: String,
        ref: 'StartNote',
        required: false
    },
    startTime: {
        type: Date,
        ref: 'StartTime',
        required: true
    },
    initiatingUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
});

const Scramble = mongoose.model('Scramble', ScrambleSchema);

module.exports = Scramble;
