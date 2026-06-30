/**
 * GET  /api/veps/:cuit          Listar VEPs del cliente
 * POST /api/veps                Generar y guardar VEP
 * PUT  /api/veps/:id/pagar      Marcar VEP como pagado
 */
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Cuotas por categoría (valores 2026)
const CUOTAS = { A: 28420, B: 31580, C: 42830, D: 52340, E: 63150, F: 78600, G: 94350 };
const DETALLE = {
  A: { integrado: 12020, obraSocial: 11800, jubilatorio: 4600 },
  B: { integrado: 14880, obraSocial: 11800, jubilatorio: 4900 },
  C: { integrado: 18430, obraSocial: 15800, jubilatorio: 8600 },
  D: { integrado: 24740, obraSocial: 18800, jubilatorio: 8800 },
  E: { integrado: 33550, obraSocial: 20800, jubilatorio: 8800 },
  F: { integrado: 48200, obraSocial: 21600, jubilatorio: 8800 },
  G: { integrado: 62950, obraSocial: 22600, jubilatorio: 8800 },
};

function genCodigo(cuit, periodo, monto) {
  const [mes, anio] = periodo.split('/');
  const rand = Math.floor(Math.random() * 9e9 + 1e9);
  return `0110${anio.slice(2)}${mes}${cuit.slice(0,8)}${rand}${String(Math.round(monto)).padStart(11,'0')}`;
}

function genNumero() {
  return `${Math.floor(Math.random() * 9e5 + 1e5)}.${Math.floor(Math.random() * 900 + 100)}`;
}

function vencimientoDelPeriodo(periodo) {
  const [mes, anio] = periodo.split('/');
  return `20/${mes}/${anio}`;
}

// GET /api/veps/:cuit
router.get('/:cuit', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const cuit = req.params.cuit.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('veps')
    .select('*')
    .eq('cuit', cuit)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST /api/veps
router.post('/', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const { cuit, periodo, categoria = 'C' } = req.body;
  if (!cuit || !periodo) return res.status(400).json({ error: 'cuit y periodo son requeridos' });

  const cuitNum = cuit.replace(/\D/g, '');
  const monto = CUOTAS[categoria] || CUOTAS.C;
  const codigo = genCodigo(cuitNum, periodo, monto);
  const numero = genNumero();
  const vencimiento = vencimientoDelPeriodo(periodo);

  const { data, error } = await supabase
    .from('veps')
    .insert({ cuit: cuitNum, periodo, numero, monto, codigo, estado: 'pendiente', vencimiento })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ ...data, detalle: DETALLE[categoria] || DETALLE.C });
});

// PUT /api/veps/:id/pagar
router.put('/:id/pagar', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const { data, error } = await supabase
    .from('veps')
    .update({ estado: 'pagado' })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
