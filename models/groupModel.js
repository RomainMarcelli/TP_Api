const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let groupSchema = new Schema({

    name: {
        type: String,
        required: true,
    },

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence à l'utilisateur qui est l'administrateur du groupe
    },

    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Référence à l'utilisateur membre du groupe
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
    }],

    inviteTokens: [{
        email: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Référence à l'utilisateur associé à l'invitation
        },
        expiresAt: Date,
    }],

    assignments: [{
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Référence à l'utilisateur participant
        },
        assignedMember: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Référence à l'utilisateur auquel le participant est attribué
        },
    }],

    rejectedInvitations: [{
        email: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Référence à l'utilisateur associé à l'invitation refusée
        },
        expiresAt: Date,
    }],
    
    drawCompleted: {
        type: Boolean,
        default: false,
    },
});

// Export du modèle Group basé sur le schéma défini
module.exports = mongoose.model('Group', groupSchema);
