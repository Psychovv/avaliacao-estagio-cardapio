// src/routes/cardapio.routes.js
const express = require('express');
const router = express.Router();
const cardapioController = require('../controllers/cardapio.controller');

router.get('/cardapio', cardapioController.getCardapio);

module.exports = router;