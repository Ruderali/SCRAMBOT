const mongoose = require('mongoose');

const UserRole = Object.freeze({
    ADMIN: 'admin',
    ORGLEAD: 'orglead',
    ORGMEMBER: 'orgmember',
    ASSOCIATE: 'associate',
    GUEST: 'guest'
});

const UserSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    discriminator: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    inGameName: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.GUEST
    },
    mute: {
        type: Boolean,
        default: true,
    },
    timezone: {
        type: String,
        required: false,
        default: 'UTC', // Default to UTC if not provided
    },
});



const User = mongoose.model('User', UserSchema);

module.exports = User;
