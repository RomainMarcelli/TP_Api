// index.js

const express = require('express');
const app = express();
const port = 3000;
const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect('mongodb://127.0.0.1:27017/apinode');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRoute = require('./routes/userRoute.js');
app.use('/users', userRoute);

app.listen(port);