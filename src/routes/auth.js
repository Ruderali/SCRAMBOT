const express = require('express');
const passport = require('../config/passport');
const User = require('../models/User')
const router = express.Router();
const db = require('../config/database');
const encryption = require('../config/encryption');


router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback', 
    (req, res, next) => {
        
        console.log('Handling Discord callback...');
        passport.authenticate('discord', { failureRedirect: '/' }, async (err, user, info) => {
            if (err) {
                console.error('Authentication error:', err);
                return res.redirect('/');
            }
            if (!user) {
                console.log('No user found, redirecting to home...');
                return res.redirect('/');
            }

            req.logIn(user, async (err) => {
                if (err) {
                    console.error('Login error:', err);
                    return res.redirect('/');
                }

                console.log('User authenticated successfully, checking database for inGameName...');

                try {
                    const existingUser = await User.findOne({ discordId: user.discordId });

                    if (!existingUser) {
                        console.log('User not found in database, creating new user...');
                        return res.redirect('/auth/finalize');
                    }

                    if (!existingUser.inGameName) {
                        console.log('inGameName is empty, redirecting to form...');
                        return res.redirect('/auth/finalize');
                    } else {
                        console.log('inGameName exists, redirecting to home...');
                        return res.redirect('/');
                    }
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    return res.redirect('/');
                }
                finally{
                }
            });
        })(req, res, next);
    }
);

router.get('/finalize', (req, res) => {
    res.render('finalize', { user: req.user }); // Render a form for finalizing the inGameName
});

router.post('/finalize', async (req, res) => {
    const { inGameName } = req.body; // Extract inGameName from the request body
    const discordId = req.user.discordId; // Assuming you store the user info in req.user

    try {
        // Update the user's inGameName in the database
        await User.findOneAndUpdate({ discordId: discordId }, { inGameName: encryption.encrypt(inGameName) });
        console.log('inGameName updated successfully, redirecting to home...');
        res.redirect('/'); // Redirect to the home page after successful update
    } catch (error) {
        console.error('Error updating inGameName:', error);
        res.status(500).send('An error occurred while updating your in-game name. Please try again.');
    }
});


module.exports = router;
