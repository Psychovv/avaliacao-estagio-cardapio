// src/app.js
const express = require('express');
const cors = require('cors');
const cardapioRoutes = require('./routes/cardapio.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/', cardapioRoutes); 

module.exports = app; 