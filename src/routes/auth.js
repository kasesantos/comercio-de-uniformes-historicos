const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Dados do colecionador autenticado
 *     description: Devolve o identificador associado ao JWT (útil para validar o token após o login).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informação do utilizador autenticado.
 *       401:
 *         description: Token não fornecido ou inválido.
 */

router.get('/me', verifyToken, (req, res) => {
    res.status(200).json({ username: req.user.sub });
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login do colecionador
 *     description: Endpoint para autenticação usando credenciais históricas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: Zico
 *               password:
 *                 type: string
 *                 example: '1981'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso, retorna o token JWT.
 *       401:
 *         description: Credenciais inválidas.
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === 'Zico' && password === '1981') {
        const token = jwt.sign({ sub: username }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token });
    }
    res.status(401).json({ error: 'Credenciais inválidas' });
});

module.exports = router;