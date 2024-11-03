const mongoose = require('mongoose');

// Moon schema
const Moon = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parentPlanet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Planet',
        required: true
    }
});

// Planet schema
const Planet = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parentSystem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StarSystem',
        required: true
    },
    moons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Moon',
        default: []  // This ensures the field is an empty array if no moons are present
    }]
});

// System schema
const StarSystem = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    planets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Planet',
        default: []  // This ensures the field is an empty array if no moons are present
    }]
});

const SystemModel = mongoose.model('StarSystem', StarSystem);
const PlanetModel = mongoose.model('Planet', Planet);
const MoonModel = mongoose.model('Moon', Moon);

module.exports = { SystemModel, PlanetModel, MoonModel };