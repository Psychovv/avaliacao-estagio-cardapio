// backend/src/controllers/pedidos.controller.js
const fs = require('fs');
const path = require('path');

const pedidosPath = path.join(__dirname, '..', 'data', 'pedidos.json');

const addPedido = (req, res) => {
    const novoPedido = req.body;

    fs.readFile(pedidosPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao ler o arquivo de pedidos.');
        }

        const pedidos = JSON.parse(data);

        novoPedido.id = Date.now(); // Adiciona um ID único baseado no tempo
        novoPedido.timestamp = new Date().toISOString(); // Adiciona data e hora do pedido

        pedidos.push(novoPedido);

        fs.writeFile(pedidosPath, JSON.stringify(pedidos, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao salvar o pedido.');
            }
            res.status(201).json({ message: "Pedido recebido com sucesso!" });
        });
    });
};

module.exports = {
    addPedido,
};