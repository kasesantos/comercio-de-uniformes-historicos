const express = require('express');

const router = express.Router();

/**
 * @openapi
 * /api/status:
 *   get:
 *     summary: Estado da API
 *     description: Indica se o serviço está no ar (útil para health checks e smoke tests).
 *     responses:
 *       200:
 *         description: API disponível.
 */
router.get('/', (req, res) => {
    res.status(200).json({ status: 'API rodando e pronta para testes automáticos!' });
});

module.exports = router;
