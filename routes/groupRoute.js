// routes/groupRoute.js

const express = require("express");
const router = express.Router();
const groupController = require('../controllers/groupController.js');
const jwtMiddleware = require('../middlewares/jwtMiddleware.js');
const { group } = require("console");

// Création d'un nouveau groupe
router.route("/create").post(jwtMiddleware.verifyToken, groupController.groupCreate);

// Routes pour un groupe spécifique en utilisant son ID
router.route("/:_id")
    .all(jwtMiddleware.verifyToken)
    .put(groupController.updateGroup)
    .patch(groupController.updateGroupPartially)
    .delete(groupController.deleteGroup);

// Inviter un utilisateur à rejoindre un groupe
router.post("/:groupId/invite", jwtMiddleware.verifyToken, groupController.inviteToGroup);

// Accepter ou refuser une invitation
router.post("/acceptordecline-invitation/:accept", jwtMiddleware.verifyToken, groupController.acceptOrDeclineInvitation);

// Obtenir des attributions aléatoires  dans un groupe
router.get("/:groupId/get-random-assignments", jwtMiddleware.verifyToken, groupController.randomAssignmentForUser);

// Obtenir la personne à qui ont doit un cadeau
router.get("/:groupId/get-random-assignments/:_id", jwtMiddleware.verifyToken, groupController.getDuoAssignmentForUser);

module.exports = router;
