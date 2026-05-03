const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/** @type {Array<{ id: number, item: string, amount: number, quantity: number, status: string, createdBy: string }>} */
const ordersStore = [];
let nextOrderId = 1;

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Lista pedidos do colecionador autenticado
 *     description: Retorna os pedidos de uniforme associados ao utilizador do token JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos (pode ser vazia).
 *       401:
 *         description: Token não fornecido ou inválido.
 *   post:
 *     summary: Registra um novo pedido de uniforme
 *     description: Cria um pedido de camisa histórica. Requer autenticação via JWT.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item:
 *                 type: string
 *                 example: "Camisa Flamengo 1981 - Mundial"
 *               amount:
 *                 type: number
 *                 example: 500.0
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pedido registrado com sucesso.
 *       401:
 *         description: Token não fornecido ou inválido.
 */

router.get('/', verifyToken, (req, res) => {
    const mine = ordersStore.filter((o) => o.createdBy === req.user.sub);
    res.status(200).json({ orders: mine });
});

router.post('/', verifyToken, (req, res) => {
    const { item, amount, quantity } = req.body;

    const newOrder = {
        id: nextOrderId++,
        item,
        amount,
        quantity,
        status: 'CREATED',
        createdBy: req.user.sub
    };

    ordersStore.push(newOrder);

    res.status(201).json({
        message: 'Pedido de uniforme histórico registrado!',
        order: newOrder
    });
});

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Obtém um pedido por identificador
 *     description: Detalhe de um pedido do próprio colecionador.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado.
 *       401:
 *         description: Token não fornecido ou inválido.
 *       404:
 *         description: Pedido inexistente ou não pertence ao utilizador.
 */

router.get('/:id', verifyToken, (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Identificador de pedido inválido.' });
    }

    const order = ordersStore.find(
        (o) => o.id === id && o.createdBy === req.user.sub
    );

    if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    res.status(200).json({ order });
});

module.exports = router;
