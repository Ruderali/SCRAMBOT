const mongoose = require('mongoose');

// Moon schema (nb this now considered 'final' location info i.e. stations etc...)
const MoonSchema = new mongoose.Schema({
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
const PlanetSchema = new mongoose.Schema({
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
const StarSystemSchema = new mongoose.Schema({
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

const StarSystem = mongoose.model('StarSystem', StarSystemSchema);
const Planet = mongoose.model('Planet', PlanetSchema);
const Moon = mongoose.model('Moon', MoonSchema);

module.exports = { StarSystem, Planet, Moon };