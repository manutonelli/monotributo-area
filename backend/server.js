require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// API routes
app.use('/api/cert', require('./routes/certs'));
app.use('/api/facturas', require('./routes/facturas'));
app.use('/api/padron', require('./routes/padron'));

// Health check
app.get('/api/health', (_, res) => res.json({ ok: true, env: process.env.ARCA_ENV || 'homo' }));

// Servir frontend desde la raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

// SPA fallback
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MonoClaro backend corriendo en http://localhost:${PORT}`);
  console.log(`Ambiente ARCA: ${process.env.ARCA_ENV || 'homo'}`);
});
