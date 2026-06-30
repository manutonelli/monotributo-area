/**
 * GET /api/pagos/:cuit           Historial de pagos de cuota mensual
 * PUT /api/pagos/:cuit/:periodo  Marcar período como pagado
 */
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

router.get('/:cuit', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const cuit = req.params.cuit.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('pagos_monotributo')
    .select('*')
    .eq('cuit', cuit)
    .order('id', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.put('/:cuit/:periodo', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const cuit = req.params.cuit.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('pagos_monotributo')
    .upsert({
      cuit,
      periodo: req.params.periodo,
      estado: 'pagado',
      fecha_pago: req.body.fecha_pago || new Date().toLocaleDateString('es-AR'),
      monto: req.body.monto,
    }, { onConflict: 'cuit,periodo' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
