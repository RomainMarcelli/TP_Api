// controllers/usersController.js

const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const saltRounds = 10;
require('dotenv').config();
const JWT_KEY = 'gfieznd';

// Fonction pour hacher le mot de passe
exports.hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
};

// Enregistrement d'un nouvel utilisateur
exports.userRegister = async (req, res) => {
    try {
        // Validation de l'adresse e-mail
        if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({ message: 'Adresse e-mail invalide' });
        }

        // Création d'un nouvel utilisateur avec mot de passe haché
        let newUser = new User(req.body);
        newUser.password = await this.hashPassword(newUser.password);
        const user = await newUser.save();
        res.status(201).json({ message: `Utilisateur créé : ${user.email}` });
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Requête invalide" });
    }
};

// Connexion de l'utilisateur
exports.loginRegister = async (req, res) => {
    try {
        // Recherche de l'utilisateur par adresse e-mail
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.status(500).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        // Comparaison du mot de passe haché
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (passwordMatch) {
            // Création du token JWT en cas de correspondance
            const userData = {
                id: user._id,
                email: user.email,
                role: 'admin',
            };

            const token = await jwt.sign(userData, JWT_KEY, { expiresIn: '10h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ message: "E-mail ou mot de passe incorrect" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Impossible de générer le token" });
    }
};

// Mise à jour d'un utilisateur
exports.updateUser = async (req, res) => {
    try {
        // Hachage du mot de passe si fourni
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, saltRounds);
        }

        // Validation de l'adresse e-mail
        if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({ message: 'Adresse e-mail invalide' });
        }

        // Recherche et mise à jour de l'utilisateur
        const user = await User.findByIdAndUpdate(req.params._id, req.body, { new: true });
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Mise à jour partielle d'un utilisateur
exports.updateUserPartially = async (req, res) => {
    try {
        // Hachage du mot de passe si fourni
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, saltRounds);
        }

        // Validation de l'adresse e-mail
        if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({ message: 'Adresse e-mail invalide' });
        }

        // Recherche et mise à jour partielle de l'utilisateur
        const user = await User.findByIdAndUpdate(req.params._id, req.body, { new: true, overwrite: true });
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Suppression d'un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        // Recherche et suppression de l'utilisateur
        await User.findByIdAndDelete(req.params._id);
        res.status(200).json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};