/**
 * GET  /api/clientes/:cuit        Obtener perfil del cliente
 * POST /api/clientes              Crear cliente nuevo
 * PUT  /api/clientes/:cuit        Actualizar perfil
 */
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

router.get('/:cuit', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const cuit = req.params.cuit.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('cuit', cuit)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.post('/', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const { cuit, nombre, categoria = 'C', estudio, email } = req.body;
  if (!cuit || !nombre) return res.status(400).json({ error: 'cuit y nombre son requeridos' });

  const { data, error } = await supabase
    .from('clientes')
    .insert({ cuit: cuit.replace(/\D/g, ''), nombre, categoria, estudio, email })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:cuit', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const cuit = req.params.cuit.replace(/\D/g, '');
  const allowed = ['nombre', 'email', 'categoria', 'estudio', 'inicio_actividad', 'actividad', 'domicilio', 'obra_social', 'notif_email', 'notif_push', 'notif_bio'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('cuit', cuit)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
