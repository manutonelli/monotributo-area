/**
 * GET  /api/facturas/ultimo/:cuit/:ptoVta/:tipo
 *   Devuelve el último número autorizado para ese punto de venta y tipo de comprobante.
 *
 * POST /api/facturas/cae
 *   Body JSON: { cuit, ptoVta, tipo, concepto, docTipo, docNro, importeTotal }
 *   Devuelve { numero, cae, vencimientoCAE }
 */

const express = require('express');
const router = express.Router();
const { getTokenSign } = require('../services/wsaa');
const { getUltimoComprobante, solicitarCAE } = require('../services/wsfev1');

const ENV = process.env.ARCA_ENV || 'homo';

// Tipo de comprobante: Factura C → 11, Factura E → 19
const TIPO_CBTE = { C: 11, E: 19 };

function hoy() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

router.get('/ultimo/:cuit/:ptoVta/:tipo', async (req, res) => {
  const { cuit, ptoVta, tipo } = req.params;
  const cuitNum = cuit.replace(/-/g, '');
  const tipoCbte = TIPO_CBTE[tipo.toUpperCase()];

  if (!tipoCbte) return res.status(400).json({ error: `Tipo inválido: ${tipo}. Usar C o E.` });

  try {
    const auth = await getTokenSign(cuitNum, 'wsfe', ENV);
    const ultimo = await getUltimoComprobante(auth, cuitNum, parseInt(ptoVta), tipoCbte, ENV);
    res.json({ ultimo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/cae', async (req, res) => {
  const { cuit, ptoVta = 1, tipo = 'C', concepto = 2, docTipo, docNro, importeTotal } = req.body;

  if (!cuit || !importeTotal) {
    return res.status(400).json({ error: 'Faltan campos requeridos: cuit, importeTotal.' });
  }

  const cuitNum = cuit.replace(/-/g, '');
  const tipoCbte = TIPO_CBTE[tipo.toUpperCase()];
  if (!tipoCbte) return res.status(400).json({ error: `Tipo inválido: ${tipo}` });

  // Determinar doc receptor
  let rDocTipo = docTipo ?? 99;  // 99 = Consumidor Final
  let rDocNro = docNro ?? 0;
  if (tipo.toUpperCase() === 'E') {
    rDocTipo = 80; // CUIT para exportación
  }

  try {
    const auth = await getTokenSign(cuitNum, 'wsfe', ENV);

    // Obtener próximo número
    const ultimo = await getUltimoComprobante(auth, cuitNum, ptoVta, tipoCbte, ENV);
    const numero = ultimo + 1;

    const resultado = await solicitarCAE(auth, cuitNum, {
      ptoVta,
      tipo: tipoCbte,
      numero,
      concepto,
      docTipo: rDocTipo,
      docNro: rDocNro,
      fecha: hoy(),
      importeTotal: parseFloat(importeTotal),
    }, ENV);

    res.json({ numero, ...resultado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
