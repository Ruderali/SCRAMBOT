const express = require('express');
const db = require('../config/database');
const { SystemModel, PlanetModel, MoonModel } = require('../models/Location');
const router = express.Router();

// Route to display the scramble form
router.get('/', async (req, res) => {
    try {
        const starSystems = await SystemModel.find()
        .populate({
            path: 'planets',
            populate: { path: 'moons' }
        });
        console.log(starSystems)
        res.render('scramble', { starSystems } );
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/submit', async (req, res) => {
    const { system, planet, moon } = req.body; // Extracting values from the request body

    try {
        // Here you can process the selected system, planet, and moon
        console.log('Selected System:', system);
        console.log('Selected Planet:', planet);
        console.log('Selected Moon:', moon);

        // Optionally, you could fetch more details about the selected items
        const selectedSystem = await SystemModel.findById(system).populate({
            path: 'planets',
            populate: { path: 'moons' }
        });

        // Responding with the selected data or redirecting
        res.render('result', { selectedSystem, selectedPlanet: planet, selectedMoon: moon });
    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
