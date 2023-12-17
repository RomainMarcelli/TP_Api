// middlewares/jwtMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware pour vérifier le token JWT
exports.verifyToken = async function (req, res, next) {
    try {
        let token = req.headers['authorization'];

        if (token !== undefined) {
            // Vérification asynchrone du token
            const payload = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(decoded);
                    }
                });
            });

            // Ajout du payload décodé à la requête
            req.user = payload;
            next();
        } else {
            // Token manquant, accès interdit
            res.status(403).json({ message: "Accès interdit : token manquant" });
        }
    } catch (error) {
        console.error(error);
        // Token invalide, accès interdit
        res.status(403).json({ message: "Accès interdit : token invalide" });
    }
};
