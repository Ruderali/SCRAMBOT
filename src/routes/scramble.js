const express = require('express');
const mongoose = require('mongoose');

const { pingMembers } = require('../bot/bot');
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

        // Notify members after saving
        await pingMembers(newScramble._id);

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

// GET route to display the mute form
router.get('/mute/:discordId', async (req, res) => {
    const discordId = req.params.discordId;

    try {
        const user = await User.findOne({ discordId });
        
        if (!user) {
            user = await User.create({
                discordId: profile.id,
                username: encryption.encrypt(profile.username),
                discriminator: encryption.encrypt(profile.discriminator),
                avatar: encryption.encrypt(profile.avatar),
                email: encryption.encrypt(profile.email)        
            })}
        // Render the form with the current mute status
        res.render('mute', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing your request");
    }
});

// POST route to handle form submission and update mute status
router.post('/mute/:discordId', async (req, res) => {
    const discordId = req.params.discordId;
    const muteStatus = req.body.mute === 'true'; // Convert radio button string to boolean

    try {
        const user = await User.findOne({ discordId });

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Update the user's mute status and save
        user.mute = muteStatus;
        await user.save();

        // Redirect to confirm the change
        res.render('mute', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing your request");
    }
});

module.exports = router;
