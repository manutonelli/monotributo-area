const supabase = require('../supabase');

async function requireAuth(req, res, next) {
  if (!supabase) return next(); // sin BD, modo demo sin auth

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Sesión expirada' });

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('cuit, is_admin')
    .eq('id', user.id)
    .single();

  req.user     = user;
  req.userCuit = usuario?.cuit || null;
  req.isAdmin  = usuario?.is_admin || false;
  next();
}

async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.isAdmin) return res.status(403).json({ error: 'Solo administradores' });
    next();
  });
}

// Verifica que el CUIT solicitado coincida con el del usuario (o sea admin)
function requireOwnCuit(paramName = 'cuit') {
  return (req, res, next) => {
    if (!supabase) return next();
    if (req.isAdmin) return next();
    const requested = (req.params[paramName] || '').replace(/\D/g, '');
    const own = (req.userCuit || '').replace(/\D/g, '');
    if (requested && requested !== own) return res.status(403).json({ error: 'Acceso denegado' });
    next();
  };
}

module.exports = { requireAuth, requireAdmin, requireOwnCuit };
