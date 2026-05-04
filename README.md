# Comércio de Uniformes Históricos

API REST em Node.js para cenários de **QA**: autenticação com JWT, pedidos de uniformes históricos, documentação OpenAPI interativa e bateria de testes (e2e, carga e relatório HTML com Mochawesome).

---

📋 User Stories (Histórias de Usuário)
Esta seção descreve as funcionalidades do ponto de vista do usuário final e os critérios de aceitação que guiaram a estratégia de testes da API.

1. Autenticação de Colecionador
Como um colecionador de mantos sagrados,
eu quero me autenticar no sistema utilizando minhas credenciais,
para que eu possa acessar minhas informações e realizar pedidos com segurança.

Critério de Aceitação: O sistema deve retornar um token JWT válido para credenciais corretas e impedir o acesso com dados inválidos (Ex: senha incorreta de 1981).

2. Gestão de Pedidos Históricos
Como um torcedor interessado em camisas retrô,
eu quero registrar novos pedidos informando o item, valor e quantidade,
para que eu possa organizar minha coleção pessoal.

Critério de Aceitação: O pedido deve ser armazenado em memória com um ID único e associado ao perfil do usuário autenticado.

3. Consulta de Histórico
Como um usuário da plataforma,
eu quero visualizar a lista de todos os meus pedidos realizados,
para que eu tenha controle sobre os itens que já adquiri.

Critério de Aceitação: A API deve retornar apenas os pedidos pertencentes ao usuário logado, garantindo a privacidade dos dados.

4. Validação de Saúde do Sistema (QA Perspective)
Como um analista de qualidade (QA),
eu quero verificar a disponibilidade do serviço através de um endpoint de status,
para que eu garanta que a infraestrutura está operando antes de iniciar as baterias de testes.

Critério de Aceitação: O endpoint /api/status deve responder com 200 OK sem a necessidade de autenticação.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js (CommonJS) |
| Servidor HTTP | [Express](https://expressjs.com/) 5 |
| Autenticação | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (Bearer JWT) |
| Documentação | [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) + [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) (OpenAPI 3) |
| Testes automatizados | [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/), [Supertest](https://github.com/ladjs/supertest) |
| Carga / performance | [Artillery](https://www.artillery.io/) |
| Relatório de testes | [Mochawesome](https://github.com/adamgruber/mochawesome) + [mochawesome-report-generator](https://github.com/adamgruber/mochawesome-report-generator) (`marge`) |
| Desenvolvimento | [nodemon](https://nodemon.io/) |

---

## Estrutura do projeto

```text
comercio-de-uniformes-historicos/
├── server.js                 # Entrada: sobe o HTTP na porta configurável
├── src/
│   ├── app.js                # Express, rotas, Swagger UI
│   ├── middleware/
│   │   └── auth.js           # JWT_SECRET e middleware verifyToken
│   └── routes/
│       ├── auth.js           # Login e perfil (/me)
│       ├── orders.js         # CRUD lógico de pedidos (memória)
│       └── status.js         # Health check
├── tests/
│   ├── e2e/                  # Fluxo completo (Mocha + Supertest)
│   ├── api/                  # Reservado a testes de API unitários/negativos (*.js)
│   └── performance/          # Artillery (orders.yml)
└── mochawesome-report/       # Gerado por npm run test:report (ignorado no Git)
```

A especificação OpenAPI é **gerada a partir dos comentários `@openapi`** nos ficheiros em `src/routes/*.js`, com `apis` apontando para `path.join(__dirname, 'routes', '*.js')` em `app.js`, para o Swagger encontrar sempre os ficheiros corretamente (independentemente do diretório de trabalho).

---

## Como executar

Na raiz do repositório:

```bash
npm install
npm start          # produção simples: node server.js
# ou
npm run dev        # reinício automático com nodemon
```

Por omissão o servidor escuta na porta **3000** (ou o valor de `process.env.PORT`).

---

## Documentação interativa (Swagger)

Com o servidor em execução:

**http://localhost:3000/api-docs/**

Aí podes experimentar os endpoints, incluir o header `Authorization: Bearer <token>` nos que exigem JWT e consultar esquemas de pedidos e respostas.

---

## Endpoints

| Método | Caminho | Autenticação | Descrição |
|--------|---------|--------------|------------|
| `GET` | `/api/status` | Não | Health check — confirma que a API está no ar. |
| `POST` | `/api/auth/login` | Não | Login; corpo JSON `username` e `password`. |
| `GET` | `/api/auth/me` | Bearer JWT | Devolve `{ "username": "<sub do token>" }`. |
| `GET` | `/api/orders` | Bearer JWT | Lista pedidos do utilizador autenticado. |
| `POST` | `/api/orders` | Bearer JWT | Cria pedido (`item`, `amount`, `quantity`). |
| `GET` | `/api/orders/:id` | Bearer JWT | Detalhe de um pedido do próprio utilizador (`404` se não existir ou não for teu). |

### Credenciais de demonstração (QA)

Para obter um token válido no login de exemplo:

- **username:** `Zico`  
- **password:** `1981`  

O segredo de assinatura do JWT é `process.env.JWT_SECRET` ou, em ambiente local sem `.env`, o valor por omissão definido em `src/middleware/auth.js`.

### Pedidos em memória

Os pedidos são guardados num **array em memória** no processo Node (ids sequenciais). Ao **reiniciar o servidor**, a lista de pedidos é perdida — adequado para testes e demos, não para persistência real.

---

## Testes e comandos

| Script | O que faz |
|--------|-----------|
| `npm run test:e2e` | Mocha sobre `tests/e2e/**/*.test.js` com Supertest contra a app **em memória** (não exige servidor à parte). |
| `npm run test:api` | Mocha em `tests/api/**/*.js` — preparado para testes de API adicionais; só corre quando existirem ficheiros nessa pasta. |
| `npm run test:load` | Artillery: `tests/performance/orders.yml`. **Exige** a API a responder em `http://localhost:3000` (por exemplo `npm start` noutro terminal). |
| `npm run test:report` | Corre os testes `tests/**/*.test.js` com reporter Mochawesome e gera o HTML com `marge` em `mochawesome-report/index.html`. |

### Fluxo E2E coberto (`tests/e2e/fluxo-completo.test.js`)

1. Login e obtenção do JWT.  
2. `GET /api/status` sem token.  
3. `GET /api/auth/me` com Bearer.  
4. `POST /api/orders` com Bearer.  
5. `GET /api/orders`.  
6. `GET /api/orders/:id` com o id devolvido na criação.

### Teste de carga (Artillery)

O ficheiro `tests/performance/orders.yml` define fases de **aquecimento** e **pico** de utilizadores virtuais que repetem o fluxo: login → captura do token → criação de pedido com `Authorization: Bearer …`.

### Relatório HTML (Mochawesome)

1. Executar: `npm run test:report`  
2. Abrir no navegador o ficheiro **`mochawesome-report/index.html`** (pasta na raiz do projeto, gerada após o comando; a pasta está no `.gitignore`).

---

## Variáveis de ambiente (opcional)

| Variável | Uso |
|----------|-----|
| `PORT` | Porta HTTP (por omissão `3000`). |
| `JWT_SECRET` | Segredo para assinar e validar JWTs (recomendado fora de demos). |

---

## Licença

ISC (ver `package.json`).
