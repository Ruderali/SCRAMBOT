const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

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
            // Update existing user
            user.username = profile.username;
            user.discriminator = profile.discriminator;
            user.avatar = profile.avatar;
            user.email = profile.email || user.email;
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                discordId: profile.id,
                username: profile.username,
                discriminator: profile.discriminator,
                avatar: profile.avatar,
                email: profile.email
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
