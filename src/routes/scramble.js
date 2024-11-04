const express = require('express');
const mongoose = require('mongoose');

const db = require('../config/database');
const Scramble = require('../models/Scramble');
const { StarSystem } = require('../models/Location');

const router = express.Router();

// Route to display the scramble form
router.get('/', async (req, res) => {
    try {
        const starSystems = await StarSystem.find()
        .populate({
            path: 'planets',
            populate: { path: 'moons' }
        });
        res.render('scramble', { starSystems } );
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/submit', async (req, res) => {
    try {
        const { system, planet, moon, timeOption, customTime, notes } = req.body;
        console.log( system, planet, moon, timeOption, customTime, notes)
        let startTime;
        if (timeOption === 'ASAP') {
            startTime = new Date();
        } else if (timeOption === 'custom') {
            // Custom time from user input (assumes the date is today if only time is given)
            const [hours, minutes] = customTime.split(':');
            startTime = new Date();
            startTime.setHours(hours, minutes, 0, 0); // Set time to custom time
        }

        // Create a new Scramble document
        const newScramble = new Scramble({
            name: "Scramble Alert", // Example; adjust as needed
            targetSystem: system,
            targetPlanet: planet,
            targetMoon: moon,
            notes: notes,
            startTime: startTime,
            //initiatingUser: req.user._id // Assuming user ID is available in the session or JWT
        });

        // Save the new scramble to the database
        await newScramble.save();

        // Redirect or respond after saving
        res.redirect(`/scramble/success/${newScramble._id}`);
    } catch (error) {
        console.error("Error submitting scramble order:", error);
        res.status(500).send("Error processing the scramble order.");
    }
});

router.get('/success/:id', async (req, res) => {
    try {
        const scramble = await Scramble.findById(req.params.id)
            .populate('targetSystem', 'name')
            .populate('targetPlanet', 'name')
            .populate('targetMoon', 'name')
            .populate('initiatingUser', 'username');
        
        if (!scramble) {
            return res.status(404).send('Scramble Order not found');
        }

        res.render('scramSuccess', { scramble });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
