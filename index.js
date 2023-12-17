// index.js

const express = require('express');
const app = express();
const port = 3000;
const mongoose = require("mongoose");
require('dotenv').config();

// Connexion à la base de données MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Tp_Api');

// Middleware pour parser les données en JSON et en URL-encoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes pour les utilisateurs
const userRoute = require('./routes/userRoute.js');
app.use('/users', userRoute);

// Routes pour les groupes
const groupRoute = require ('./routes/groupRoute.js');
app.use('/groups', groupRoute);

// Lancement du serveur sur le port spécifié
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
