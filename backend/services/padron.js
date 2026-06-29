/**
 * Padrón Alcance 5 (ws_sr_padron_a5)
 *
 * Permite consultar datos básicos de cualquier CUIT:
 * razón social, condición de IVA, domicilio fiscal, estado de clave.
 *
 * No requiere autorización especial (a diferencia de A13).
 */

const axios = require('axios');
const xml2js = require('xml2js');

const URLS = {
  homo: 'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5',
  prod: 'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5',
};

async function getPersona({ token, sign }, cuitRepresentada, cuitConsultada, env = 'homo') {
  // Limpiar guiones del CUIT consultado
  const idPersona = String(cuitConsultada).replace(/-/g, '');

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:per="http://a5.soap.services.puc.sr.afip.gov.ar/">
  <soapenv:Header/>
  <soapenv:Body>
    <per:getPersona>
      <token>${token}</token>
      <sign>${sign}</sign>
      <cuitRepresentada>${cuitRepresentada}</cuitRepresentada>
      <idPersona>${idPersona}</idPersona>
    </per:getPersona>
  </soapenv:Body>
</soapenv:Envelope>`;

  const res = await axios.post(URLS[env], envelope, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
    },
    timeout: 15_000,
  });

  const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });

  // Navegar la respuesta SOAP (el namespace varía entre homo y prod)
  const body =
    parsed['soap:Envelope']?.['soap:Body'] ||
    parsed['soapenv:Envelope']?.['soapenv:Body'] ||
    parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];

  // Si la clave no existe en el padrón, ARCA devuelve un error SOAP
  const fault = body?.['soap:Fault'] || body?.['soapenv:Fault'];
  if (fault) {
    const msg = fault.faultstring || 'CUIT no encontrado';
    throw new Error(String(msg));
  }

  const personaReturn =
    body?.['ns2:getPersonaResponse']?.personaReturn ||
    body?.['getPersonaResponse']?.personaReturn;

  if (!personaReturn) return null;

  const dg = personaReturn.datosGenerales;
  if (!dg) return null;

  // Construir nombre/razón social
  const razonSocial =
    dg.razonSocial ||
    [dg.nombre, dg.apellido].filter(Boolean).join(' ') ||
    'Sin denominación';

  // Condición de IVA simplificada
  const ivaDesc = {
    '1': 'IVA Responsable Inscripto',
    '4': 'IVA Sujeto Exento',
    '6': 'Responsable Monotributo',
    '7': 'Sujeto No Categorizado',
    '9': 'IVA Liberado',
    '10': 'IVA Responsable No Inscripto',
    '13': 'Pequeño Contribuyente Eventual',
    '16': 'IVA No Alcanzado',
  };

  const condicionIVAId = dg.datosMonotributo?.categoriaMonotributo ||
    (dg.tipoPersona === 'F' ? '6' : '1');

  return {
    cuit: String(dg.idPersona),
    razonSocial,
    tipoPersona: dg.tipoPersona === 'F' ? 'Física' : 'Jurídica',
    estadoClave: dg.estadoClave,
    condicionIVA: ivaDesc[condicionIVAId] || 'Responsable Monotributo',
  };
}

module.exports = { getPersona };
