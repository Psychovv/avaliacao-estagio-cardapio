// backend/src/app.js (
const express = require('express');
const cors = require('cors');
const cardapioRoutes = require('./routes/cardapio.routes');
const pedidosRoutes = require('./routes/pedidos.routes'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', cardapioRoutes);
app.use('/', pedidosRoutes); 

module.exports = app;