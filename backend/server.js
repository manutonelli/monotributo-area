require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const { requireAuth, requireOwnCuit } = require('./middleware/auth');

// API routes — auth (public)
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/admin',     require('./routes/admin'));

// API routes — protected
app.use('/api/clientes',  requireAuth, require('./routes/clientes'));
app.use('/api/facturas',  requireAuth, require('./routes/facturas'));
app.use('/api/veps',      requireAuth, require('./routes/veps'));
app.use('/api/pagos',     requireAuth, require('./routes/pagos'));
app.use('/api/cert',      requireAuth, require('./routes/certs'));
app.use('/api/padron',    requireAuth, require('./routes/padron'));

// Health check
app.get('/api/health', (_, res) => res.json({
  ok: true,
  env: process.env.ARCA_ENV || 'homo',
  bd: !!process.env.SUPABASE_URL,
}));

// Servir frontend
app.use(express.static(path.join(__dirname, '..')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AreaGo backend en http://localhost:${PORT}`);
  console.log(`ARCA: ${process.env.ARCA_ENV || 'homo'} | Supabase: ${process.env.SUPABASE_URL ? '✓' : '✗ (sin BD)'}`);
});
