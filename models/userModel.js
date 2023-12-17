// // models/usermodel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    
    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        default: 'user', // Rôle par défaut, peut également être 'admin'
    },

    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    }],
});

module.exports = mongoose.model('User', userSchema);

