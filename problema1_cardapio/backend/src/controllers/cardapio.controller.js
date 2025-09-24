const fs = require('fs');
const path = require('path');

const cardapioPath = path.join(__dirname, '..', 'data', 'cardapio.json');

const getCardapio = (req, res) => {
  fs.readFile(cardapioPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro interno ao processar sua solicitação.');
    }
    res.json(JSON.parse(data));
  });
};

module.exports = {
  getCardapio,
};