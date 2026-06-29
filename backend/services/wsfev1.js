/**
 * WSFEv1 — Web Service de Facturación Electrónica versión 1
 *
 * Endpoints relevantes:
 *   FECompUltimoAutorizado  → último número de comprobante autorizado
 *   FECAESolicitar          → solicita CAE para una factura
 *   FEParamGetTiposCbte     → tipos de comprobante (referencia)
 */

const axios = require('axios');
const xml2js = require('xml2js');

const URLS = {
  homo: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  prod: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
};

const NS = 'http://ar.gov.afip.dif.FEV1/';

async function soapPost(url, action, bodyXml) {
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ar="${NS}">
  <soapenv:Header/>
  <soapenv:Body>${bodyXml}</soapenv:Body>
</soapenv:Envelope>`;

  const res = await axios.post(url, envelope, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': `${NS}${action}`,
    },
    timeout: 30_000,
  });

  const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
  const soapBody = parsed['soap:Envelope']?.['soap:Body'] || parsed['soapenv:Envelope']?.['soapenv:Body'];
  return soapBody;
}

function authBlock(token, sign, cuit) {
  return `<ar:Auth>
    <ar:Token>${token}</ar:Token>
    <ar:Sign>${sign}</ar:Sign>
    <ar:Cuit>${cuit}</ar:Cuit>
  </ar:Auth>`;
}

function extractErrors(result) {
  const errs = result?.Errors?.Err;
  if (!errs) return null;
  const list = Array.isArray(errs) ? errs : [errs];
  return list.map(e => `[${e.Code}] ${e.Msg}`).join(' | ');
}

/**
 * Devuelve el último número de comprobante autorizado para un punto de venta y tipo.
 * Si nunca se emitió ninguno, ARCA devuelve 0.
 *
 * @param {object} auth   { token, sign }
 * @param {string} cuit   CUIT sin guiones
 * @param {number} ptoVta Punto de venta (ej: 1)
 * @param {number} tipo   Tipo de comprobante (11=Factura C, 19=Factura E)
 * @param {string} env    'homo' | 'prod'
 */
async function getUltimoComprobante({ token, sign }, cuit, ptoVta, tipo, env = 'homo') {
  const body = `
<ar:FECompUltimoAutorizado>
  ${authBlock(token, sign, cuit)}
  <ar:PtoVta>${ptoVta}</ar:PtoVta>
  <ar:CbteTipo>${tipo}</ar:CbteTipo>
</ar:FECompUltimoAutorizado>`;

  const soapBody = await soapPost(URLS[env], 'FECompUltimoAutorizado', body);
  const result = soapBody?.['FECompUltimoAutorizadoResponse']?.FECompUltimoAutorizadoResult;

  const errMsg = extractErrors(result);
  if (errMsg) throw new Error(`WSFEv1 FECompUltimoAutorizado: ${errMsg}`);

  return parseInt(result.CbteNro, 10);
}

/**
 * Solicita CAE para una factura.
 *
 * @param {object} auth     { token, sign }
 * @param {string} cuit     CUIT emisor sin guiones
 * @param {object} factura  { ptoVta, tipo, numero, concepto, docTipo, docNro, fecha, importeTotal }
 * @param {string} env
 *
 * concepto: 1=Productos 2=Servicios 3=Productos y Servicios
 * docTipo:  80=CUIT 86=CUIL 96=DNI 99=Consumidor Final
 * fecha:    'YYYYMMDD'
 */
async function solicitarCAE({ token, sign }, cuit, factura, env = 'homo') {
  const { ptoVta, tipo, numero, concepto, docTipo, docNro, fecha, importeTotal } = factura;

  const body = `
<ar:FECAESolicitar>
  ${authBlock(token, sign, cuit)}
  <ar:FeCAEReq>
    <ar:FeCabReq>
      <ar:CantReg>1</ar:CantReg>
      <ar:PtoVta>${ptoVta}</ar:PtoVta>
      <ar:CbteTipo>${tipo}</ar:CbteTipo>
    </ar:FeCabReq>
    <ar:FeDetReq>
      <ar:FECAEDetRequest>
        <ar:Concepto>${concepto}</ar:Concepto>
        <ar:DocTipo>${docTipo}</ar:DocTipo>
        <ar:DocNro>${docNro}</ar:DocNro>
        <ar:CbteDesde>${numero}</ar:CbteDesde>
        <ar:CbteHasta>${numero}</ar:CbteHasta>
        <ar:CbteFch>${fecha}</ar:CbteFch>
        <ar:ImpTotal>${importeTotal.toFixed(2)}</ar:ImpTotal>
        <ar:ImpTotConc>0.00</ar:ImpTotConc>
        <ar:ImpNeto>${importeTotal.toFixed(2)}</ar:ImpNeto>
        <ar:ImpOpEx>0.00</ar:ImpOpEx>
        <ar:ImpIVA>0.00</ar:ImpIVA>
        <ar:ImpTrib>0.00</ar:ImpTrib>
        <ar:MonId>PES</ar:MonId>
        <ar:MonCotiz>1</ar:MonCotiz>
      </ar:FECAEDetRequest>
    </ar:FeDetReq>
  </ar:FeCAEReq>
</ar:FECAESolicitar>`;

  const soapBody = await soapPost(URLS[env], 'FECAESolicitar', body);
  const result = soapBody?.['FECAESolicResponse']?.FECAESolicResult;

  const errMsg = extractErrors(result);
  if (errMsg) throw new Error(`WSFEv1 FECAESolicitar: ${errMsg}`);

  const det = result?.FeDetResp?.FECAEDetResponse;
  if (!det) throw new Error('WSFEv1: respuesta sin detalle');

  if (det.Resultado === 'R') {
    const obs = det.Observaciones?.Obs;
    const msgs = obs ? (Array.isArray(obs) ? obs : [obs]).map(o => `[${o.Code}] ${o.Msg}`).join(' | ') : 'Rechazada';
    throw new Error(`Factura rechazada por ARCA: ${msgs}`);
  }

  // Formatear fecha de vencimiento CAE: YYYYMMDD → DD/MM/YYYY
  const v = det.CAEFchVto;
  const vencimiento = v ? `${v.slice(6, 8)}/${v.slice(4, 6)}/${v.slice(0, 4)}` : null;

  return {
    cae: det.CAE,
    vencimientoCAE: vencimiento,
    resultado: det.Resultado,
  };
}

module.exports = { getUltimoComprobante, solicitarCAE };
