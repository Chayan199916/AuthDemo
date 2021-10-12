const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: 'Your email is required',
            trim: true
        },
        password: {
            type: String,
            min: 8
        },
        username: {
            type: String,
            unique: true,
            required: 'Your username is required'
        },
        address: {
            type: String,
            required: true
        },
        mobile: {
            type: String,
            required: true,
            trim: true
        }
    }
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);