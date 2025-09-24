// backend/src/routes/pedidos.routes.js
const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

router.post('/pedidos', pedidosController.addPedido);

module.exports = router;