/**
 * Rutas solo para admins
 *
 * GET  /api/admin/clientes           Listar todos los clientes
 * GET  /api/admin/clientes/:cuit     Ver detalle de un cliente
 * POST /api/admin/usuarios           Crear usuario + cliente
 * PUT  /api/admin/clientes/:cuit     Editar cliente
 * DELETE /api/admin/usuarios/:id     Eliminar usuario
 * GET  /api/admin/stats              Stats globales
 */
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [{ count: totalClientes }, { data: facturas }] = await Promise.all([
    supabase.from('clientes').select('*', { count: 'exact', head: true }),
    supabase.from('facturas').select('monto'),
  ]);
  const totalFacturado = (facturas || []).reduce((s, f) => s + Number(f.monto), 0);
  const totalFacturas  = (facturas || []).length;
  res.json({ totalClientes: totalClientes || 0, totalFacturado, totalFacturas });
});

// GET /api/admin/clientes
router.get('/clientes', async (req, res) => {
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Agregar conteo de facturas por cliente
  const { data: facturasCounts } = await supabase
    .from('facturas')
    .select('cuit_emisor');

  const counts = {};
  (facturasCounts || []).forEach(f => { counts[f.cuit_emisor] = (counts[f.cuit_emisor] || 0) + 1; });

  // Agregar usuario vinculado
  const { data: usuarios } = await supabase.from('usuarios').select('cuit, id');
  const userByCuit = {};
  (usuarios || []).forEach(u => { if (u.cuit) userByCuit[u.cuit] = u.id; });

  res.json((clientes || []).map(c => ({
    ...c,
    totalFacturas: counts[c.cuit] || 0,
    tieneUsuario: !!userByCuit[c.cuit],
    usuarioId: userByCuit[c.cuit] || null,
  })));
});

// GET /api/admin/clientes/:cuit
router.get('/clientes/:cuit', async (req, res) => {
  const cuit = req.params.cuit.replace(/\D/g, '');

  const [{ data: cliente, error }, { data: facturas }, { data: vepsData }] = await Promise.all([
    supabase.from('clientes').select('*').eq('cuit', cuit).single(),
    supabase.from('facturas').select('*').eq('cuit_emisor', cuit).order('created_at', { ascending: false }),
    supabase.from('veps').select('*').eq('cuit', cuit).order('created_at', { ascending: false }),
  ]);

  if (error) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ cliente, facturas: facturas || [], veps: vepsData || [] });
});

// POST /api/admin/usuarios  — crea auth user + cliente + usuario vinculado
router.post('/usuarios', async (req, res) => {
  const { email, password, cuit, nombre, categoria = 'C', estudio, domicilio, actividad, obraSocial } = req.body;
  if (!email || !password || !cuit || !nombre)
    return res.status(400).json({ error: 'email, password, cuit y nombre son requeridos' });

  const cuitNum = cuit.replace(/\D/g, '');

  // 1. Crear auth user (sin email verification)
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr) return res.status(500).json({ error: authErr.message });

  // 2. Crear/actualizar registro en clientes
  const { error: clienteErr } = await supabase.from('clientes').upsert({
    cuit: cuitNum, nombre, categoria, estudio,
    domicilio: domicilio || null,
    actividad: actividad || 'Servicios profesionales',
    obra_social: obraSocial || 'OSDE — Plan 210',
  }, { onConflict: 'cuit' });
  if (clienteErr) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return res.status(500).json({ error: clienteErr.message });
  }

  // 3. Vincular usuario → CUIT
  const { error: usuarioErr } = await supabase.from('usuarios').insert({
    id: authData.user.id, cuit: cuitNum, is_admin: false,
  });
  if (usuarioErr) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return res.status(500).json({ error: usuarioErr.message });
  }

  res.status(201).json({ ok: true, userId: authData.user.id, cuit: cuitNum });
});

// PUT /api/admin/clientes/:cuit
router.put('/clientes/:cuit', async (req, res) => {
  const cuit = req.params.cuit.replace(/\D/g, '');
  const allowed = ['nombre', 'email', 'categoria', 'estudio', 'inicio_actividad', 'actividad', 'domicilio', 'obra_social'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('clientes').update(updates).eq('cuit', cuit).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/admin/usuarios/:id
router.delete('/usuarios/:id', async (req, res) => {
  const { error } = await supabase.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
