/**
 * GET  /api/facturas/:cuit              Listar facturas del cliente
 * POST /api/facturas/cae               Solicitar CAE a ARCA + guardar en BD
 * GET  /api/facturas/ultimo/:cuit/:ptoVta/:tipo
 */
const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { getTokenSign } = require('../services/wsaa');
const { getUltimoComprobante, solicitarCAE } = require('../services/wsfev1');

const ENV = process.env.ARCA_ENV || 'homo';
const TIPO_CBTE = { C: 11, E: 19 };

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}
function fechaDDMMYYYY() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Convierte fila de BD al formato que espera el frontend
function toFrontend(row) {
  return {
    num: row.numero,
    cliente: row.cliente_nombre || 'Consumidor Final',
    cuit: row.cliente_cuit || '—',
    monto: Number(row.monto),
    fecha: row.fecha,
    tipo: row.tipo,
    concepto: row.concepto || '',
    cae: row.cae || '',
    vencimientoCAE: row.vencimiento_cae || '',
  };
}

// GET /api/facturas/:cuit
router.get('/:cuit', async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'BD no configurada' });

  const cuit = req.params.cuit.replace(/\D/g, '');
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .eq('cuit_emisor', cuit)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(toFrontend));
});

// GET /api/facturas/ultimo/:cuit/:ptoVta/:tipo
router.get('/ultimo/:cuit/:ptoVta/:tipo', async (req, res) => {
  const { cuit, ptoVta, tipo } = req.params;
  const tipoCbte = TIPO_CBTE[tipo.toUpperCase()];
  if (!tipoCbte) return res.status(400).json({ error: `Tipo inválido: ${tipo}` });

  try {
    const auth = await getTokenSign(cuit.replace(/-/g,''), 'wsfe', ENV);
    const ultimo = await getUltimoComprobante(auth, cuit.replace(/-/g,''), parseInt(ptoVta), tipoCbte, ENV);
    res.json({ ultimo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/facturas/cae
router.post('/cae', async (req, res) => {
  const { cuit, ptoVta = 1, tipo = 'C', concepto = 2, docTipo, docNro, importeTotal,
          clienteNombre, clienteCuit } = req.body;

  if (!cuit || !importeTotal) return res.status(400).json({ error: 'Faltan campos: cuit, importeTotal' });

  const cuitNum = cuit.replace(/\D/g, '');
  const tipoCbte = TIPO_CBTE[tipo.toUpperCase()];
  if (!tipoCbte) return res.status(400).json({ error: `Tipo inválido: ${tipo}` });

  let rDocTipo = docTipo ?? 99;
  let rDocNro  = docNro  ?? 0;
  if (tipo.toUpperCase() === 'E') rDocTipo = 80;

  try {
    const auth = await getTokenSign(cuitNum, 'wsfe', ENV);
    const ultimo = await getUltimoComprobante(auth, cuitNum, ptoVta, tipoCbte, ENV);
    const numero = ultimo + 1;

    const resultado = await solicitarCAE(auth, cuitNum, {
      ptoVta, tipo: tipoCbte, numero, concepto,
      docTipo: rDocTipo, docNro: rDocNro,
      fecha: hoy(), importeTotal: parseFloat(importeTotal),
    }, ENV);

    const numeroFmt = `${String(ptoVta).padStart(4,'0')}-${String(numero).padStart(8,'0')}`;
    const fechaFmt  = fechaDDMMYYYY();

    // Guardar en Supabase si está configurado
    if (supabase) {
      await supabase.from('facturas').insert({
        cuit_emisor: cuitNum,
        numero: numeroFmt,
        pto_vta: ptoVta,
        tipo: tipo.toUpperCase(),
        cliente_nombre: clienteNombre || null,
        cliente_cuit: clienteCuit || null,
        concepto: req.body.conceptoTexto || null,
        monto: parseFloat(importeTotal),
        fecha: fechaFmt,
        cae: resultado.cae,
        vencimiento_cae: resultado.vencimientoCAE,
      });
    }

    res.json({ numero, numFormatted: numeroFmt, ...resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
