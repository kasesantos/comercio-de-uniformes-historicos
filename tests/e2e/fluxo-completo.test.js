const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');

describe('E2E - Fluxo Completo de Pedido', () => {
    let token;
    let orderId;

    it('1.Deve fazer login do administrador e obter um token JWT', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'Zico', password: '1981' });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token');
        token = res.body.token;
    });

    it('2. Deve expor o estado da API sem autenticação', async () => {
        const res = await request(app).get('/api/status');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status');
    });

    it('3. Deve devolver o utilizador autenticado em /api/auth/me', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.include({ username: 'Zico' });
    });

    it('4. Deve criar um pedido de camisa histórica usando o token', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({
                item: 'Camisa Flamengo de 1981 - Mundial',
                amount: 500.0,
                quantity: 1
            });

        expect(res.status).to.equal(201);
        expect(res.body.order).to.have.property('id');
        orderId = res.body.order.id;
    });

    it('5. Deve listar os pedidos do colecionador', async () => {
        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).to.equal(200);
        expect(res.body.orders).to.be.an('array');
        expect(res.body.orders.some((o) => o.id === orderId)).to.equal(true);
    });

    it('6. Deve obter o detalhe do pedido por id', async () => {
        const res = await request(app)
            .get(`/api/orders/${orderId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).to.equal(200);
        expect(res.body.order.id).to.equal(orderId);
        expect(res.body.order.item).to.include('1981');
    });
});
