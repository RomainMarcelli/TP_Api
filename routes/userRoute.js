// routes/usersRoute.js

const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController.js');
const jwtMiddleware = require('../middlewares/jwtMiddleware.js');

router.route("/register").post(userController.userRegister);

router.route("/login").post(userController.loginRegister);

router.route("/:_id")
    .all(jwtMiddleware.verifyToken)
    .put(userController.updateUser)
    .patch(userController.updateUserPartially)
    .delete(userController.deleteUser);
    
module.exports = router;
