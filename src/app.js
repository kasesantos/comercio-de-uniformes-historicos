const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const statusRoutes = require('./routes/status');
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/status', statusRoutes);

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'API Comércio de Uniformes Históricos',
        version: '1.0.0',
        description: 'API para gerenciamento de pedidos e camisas com foco em QA'
      },
      servers: [
        { url: 'http://localhost:3000' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    apis: [path.join(__dirname, 'routes', '*.js')]
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;
