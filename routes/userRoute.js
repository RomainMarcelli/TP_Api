// routes/usersRoute.js

const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController.js');
const jwtMiddleware = require('../middlewares/jwtMiddleware.js');

// Endpoint pour l'inscription d'un nouvel utilisateur
router.route("/register").post(userController.userRegister);

// Endpoint pour la connexion d'un utilisateur
router.route("/login").post(userController.loginRegister);

// Endpoints pour la gestion d'un utilisateur par son ID
router.route("/:_id")
    .all(jwtMiddleware.verifyToken) // Middleware pour vérifier le token JWT dans toutes les requêtes pour cet endpoint
    .put(userController.updateUser) // Mettre à jour un utilisateur
    .patch(userController.updateUserPartially) // Mettre à jour partiellement un utilisateur
    .delete(userController.deleteUser); // Supprimer un utilisateur

module.exports = router;
