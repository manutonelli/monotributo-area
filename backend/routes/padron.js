/**
 * GET /api/padron/:cuitConsultada?cuitEmisor=XXXX
 *
 * Consulta Padrón A5 para obtener razón social y condición IVA de un CUIT.
 * El CUIT emisor (cuitEmisor) es el del contribuyente autenticado — se usa
 * para autenticar contra WSAA con su propio certificado.
 */

const express = require('express');
const router = express.Router();
const { getTokenSign } = require('../services/wsaa');
const { getPersona } = require('../services/padron');

const ENV = process.env.ARCA_ENV || 'homo';

router.get('/:cuitConsultada', async (req, res) => {
  const { cuitConsultada } = req.params;
  const cuitEmisor = (req.query.cuitEmisor || '').replace(/-/g, '');

  if (!cuitEmisor) {
    return res.status(400).json({ error: 'Se requiere el parámetro ?cuitEmisor=XXXX' });
  }

  const cuitLimpio = cuitConsultada.replace(/-/g, '');
  if (!/^\d{11}$/.test(cuitLimpio)) {
    return res.status(400).json({ error: 'CUIT inválido. Debe tener 11 dígitos.' });
  }

  try {
    const auth = await getTokenSign(cuitEmisor, 'ws_sr_padron_a5', ENV);
    const persona = await getPersona(auth, cuitEmisor, cuitLimpio, ENV);

    if (!persona) {
      return res.status(404).json({ error: 'CUIT no encontrado en el padrón.' });
    }

    res.json(persona);
  } catch (err) {
    const status = err.message.includes('no encontrado') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;
