const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');
const encryption = require('./encryption');

const clientID = process.env.DISCORD_CLIENT;
const clientSecret = process.env.DISCORD_SECRET;
const callbackURL = process.env.DISCORD_CALLBACK;

passport.use(new DiscordStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL,
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {

        let user = await User.findOne({ discordId: profile.id });

        if (user) {
            user.username = encryption.encrypt(profile.username);
            user.discriminator = encryption.encrypt(profile.discriminator);
            user.avatar = encryption.encrypt(profile.avatar);
            user.email = encryption.encrypt(profile.email) || encryption.encrypt(user.email);
            await user.save();
        } else {
            user = await User.create({
                discordId: profile.id,
                username: encryption.encrypt(profile.username),
                discriminator: encryption.encrypt(profile.discriminator),
                avatar: encryption.encrypt(profile.avatar),
                email: encryption.encrypt(profile.email)
            });
        }
        
        return done(null, user);
    } catch (err) {
        console.error('Error in Discord strategy:', err);
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
