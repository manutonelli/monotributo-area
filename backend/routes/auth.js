/**
 * POST /api/auth/login     Iniciar sesión
 * GET  /api/auth/me        Obtener usuario actual
 * POST /api/auth/logout    Cerrar sesión (client-side)
 */
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

router.post('/login', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Email o contraseña incorrectos' });

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('cuit, is_admin')
    .eq('id', data.user.id)
    .single();

  let perfil = null;
  if (usuario?.cuit) {
    const { data: cliente } = await supabase
      .from('clientes').select('*').eq('cuit', usuario.cuit).single();
    perfil = cliente;
  }

  res.json({
    token: data.session.access_token,
    user: {
      id:      data.user.id,
      email:   data.user.email,
      isAdmin: usuario?.is_admin || false,
      cuit:    usuario?.cuit || null,
      perfil,
    },
  });
});

router.get('/me', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Sesión expirada' });

  const { data: usuario } = await supabase
    .from('usuarios').select('cuit, is_admin').eq('id', user.id).single();

  let perfil = null;
  if (usuario?.cuit) {
    const { data: cliente } = await supabase
      .from('clientes').select('*').eq('cuit', usuario.cuit).single();
    perfil = cliente;
  }

  res.json({
    id:      user.id,
    email:   user.email,
    isAdmin: usuario?.is_admin || false,
    cuit:    usuario?.cuit || null,
    perfil,
  });
});

router.post('/logout', (_, res) => res.json({ ok: true }));

module.exports = router;
