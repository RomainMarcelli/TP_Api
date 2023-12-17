// controllers/groupController.js

const User = require('../models/userModel.js');
const Group = require('../models/groupModel.js');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { attribuerMembres } = require('../utils/randomAssignment');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
require('dotenv').config();
// const JWT_KEY = 'gfieznd';

// Créer un Groupe

exports.groupCreate = async (req, res) => {
    try {
        // Créez un nouveau groupe
        const newGroup = new Group({
            name: req.body.name,
            admin: req.user.id
        });

        // Ajoute l'ID du groupe à l'utilisateur admin
        const adminUser = await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { groups: newGroup._id },
            role: 'admin',
        }, { new: true });

        // Enregistre le groupe
        const group = await newGroup.save();

        res.status(201).json({ group, adminUser });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Error creating group", error: error.message });
    }
};


// Modifier le groupe

exports.updateGroup = async (req, res) => {
    try {
        const group = await Group.findByIdAndUpdate(req.params._id, req.body, { new: true });
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error serveur" });
    }
};

// Modifier le groupe

exports.updateGroupPartially = async (req, res) => {
    try {
        const group = await Group.findByIdAndUpdate(req.params._id, req.body, { new: true, overwrite: false });
        if (!group) {
            res.status(404).json({ message: 'Group not found' });
            return;
        }
        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error serveur" });
    }
};

// Supprimer le groupe

exports.deleteGroup = async (req, res) => {
    try {
        await Group.findByIdAndDelete(req.params._id);
        res.status(200).json({ message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ message: "Error serveur" });
    }
};

// Inviter un utilisateur grâce à son adresse mail dans le groupe 

exports.inviteToGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }

        if (group.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        if (!req.body || !req.body.email) {
            return res.status(400).json({ message: 'L\'adresse email est requise pour envoyer une invitation' });
        }

        if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({ message: 'Adresse e-mail invalide' });
        }

        const email = req.body.email;

        const userAlreadyInGroup = group.members.some(member => member.user && member.user.email === email);
        if (userAlreadyInGroup) {
            return res.status(400).json({ message: 'L\'utilisateur fait déjà partie du groupe' });
        }

        const existingInvitation = group.inviteTokens.find(invitation => invitation.email === email);
        if (existingInvitation) {
            return res.status(400).json({ message: 'L\'utilisateur a déjà reçu une invitation' });
        }

        group.inviteTokens.push({ email, expiresAt: new Date(Date.now() + 3600000) });
        await group.save();

        res.status(200).json({ message: `Invitation envoyée à l'utilisateur avec l'adresse email : ${email}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};


// Accepter l'invitation ou la décliner 

exports.acceptOrDeclineInvitation = async (req, res) => {
    try {
        const { email, groupId } = req.body;
        const accept = req.params.accept;

        if (!email || !groupId) {
            return res.status(400).json({ message: 'L\'adresse email et l\'ID du groupe sont requis' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }

        const invitation = group.inviteTokens.find(inv => inv.email === email);

        if (!invitation || new Date(invitation.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Invitation invalide ou expirée' });
        }

        // Nouvelle logique pour accepter ou refuser l'invitation
        if (accept === 'true') {
            // Si accept est 'true', alors l'invitation est acceptée
            group.members.push({ user: req.user.id });
            // Supprime l'invitation acceptée de la liste
            group.inviteTokens = group.inviteTokens.filter(inv => inv !== invitation);
        } else if (accept === 'false') {
            // Si accept est 'false', déplace l'invitation vers la liste des invitations refusées
            group.rejectedInvitations.push(invitation);
            // Supprime l'invitation refusée de la liste
            group.inviteTokens = group.inviteTokens.filter(inv => inv !== invitation);
        } else {
            return res.status(400).json({ message: 'La valeur d\'acceptation doit être soit true, soit false' });
        }

        await group.save();

        res.status(200).json({ message: accept === 'true' ? 'Invitation acceptée' : 'Invitation refusée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


// Assignation aléatoire de tous les groupes

exports.randomAssignmentForUser = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        // Récupére le groupe
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }

        // Vérifie si le tirage au sort a déjà été effectué
        if (group.drawCompleted) {
            return res.status(400).json({ message: 'Vous avez déjà procédé au tirage au sort' });
        }

        // Génére des attributions aléatoires pour tous les membres
        const allMembers = group.members.map(member => member._id);
        const attributions = attribuerMembres(allMembers, allMembers);

        // Mette à jour le champ drawCompleted pour le groupe
        group.drawCompleted = true;
        await group.save();

        // Retourne le résultat
        return res.status(200).json({ message: `Attributions générées avec succès`, attributions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Assignation de la personne à qui l'on doit un cadeau

exports.getDuoAssignmentForUser = async (req, res) => {
    try {
        const _id = req.params._id;

        // Récupére le groupe de l'utilisateur
        const group = await Group.findOne({ members: { $elemMatch: { _id: _id } } });

        if (!group) {
            return res.status(404).json({ message: 'L\'utilisateur ne fait pas partie d\'un groupe' });
        }

        // Vérifie si le tirage au sort a déjà été effectué
        if (group.drawCompleted) {
            return res.status(400).json({ message: 'Vous avez déjà procédé au tirage au sort' });
        }
        // Récupére les membres du groupe
        const groupMembers = group.members.map(member => member._id);

        // Génére une attribution en duo, en évitant l'utilisateur lui-même
        const duoAssignment = attribuerMembres(groupMembers, _id);

        // Retourne le résultat
        return res.status(200).json({ message: `Vous devez un cadeau à : ${duoAssignment[_id]}` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
};




