/**
 * WSAA — Web Service de Autenticación y Autorización de ARCA
 *
 * Flow:
 *  1. Crear TRA (Ticket de Requerimiento de Acceso) — XML firmado con el cert del contribuyente
 *  2. Firmar el TRA con OpenSSL → CMS (PKCS#7) sin atributos autenticados (requisito ARCA)
 *  3. Enviar al WSAA → recibe TA (token + sign) válido por ~12hs
 *  4. Cachear el TA en disco para no re-autenticar en cada llamada
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const xml2js = require('xml2js');

const URLS = {
  homo: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
  prod: 'https://wsaa.afip.gov.ar/ws/services/LoginCms',
};

const TOKENS_DIR = path.join(__dirname, '..', 'tokens');
if (!fs.existsSync(TOKENS_DIR)) fs.mkdirSync(TOKENS_DIR, { recursive: true });

function buildTRA(service) {
  const now = new Date();
  // Argentina UTC-3 offset hardcoded; para prod usar luxon o moment-timezone
  const offset = '-03:00';
  const fmt = (d) => {
    const iso = new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 19);
    return iso + offset;
  };
  const gen = new Date(now.getTime() - 60_000);     // 1 min atrás
  const exp = new Date(now.getTime() + 12 * 3600_000); // 12hs adelante

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<loginTicketRequest version="1.0">',
    '  <header>',
    `    <uniqueId>${Math.floor(Date.now() / 1000)}</uniqueId>`,
    `    <generationTime>${fmt(gen)}</generationTime>`,
    `    <expirationTime>${fmt(exp)}</expirationTime>`,
    '  </header>',
    `  <service>${service}</service>`,
    '</loginTicketRequest>',
  ].join('\n');
}

function signTRA(tra, certPemPath, keyPemPath) {
  // Escribir TRA a archivo temporal
  const tmpDir = os.tmpdir();
  const traPath = path.join(tmpDir, `tra_${Date.now()}.xml`);
  const cmsPath = path.join(tmpDir, `cms_${Date.now()}.der`);

  try {
    fs.writeFileSync(traPath, tra, 'utf8');

    // -nodetach: incluir el contenido en el CMS (ARCA lo requiere)
    // -noattr: sin authenticated attributes (ARCA usa CMS no-estándar)
    // -outform DER: formato binario que espera WSAA
    execSync(
      `openssl cms -sign -in "${traPath}" -out "${cmsPath}" -outform DER ` +
      `-signer "${certPemPath}" -inkey "${keyPemPath}" -nodetach -noattr 2>&1`,
      { stdio: 'pipe' }
    );

    const der = fs.readFileSync(cmsPath);
    return der.toString('base64');
  } finally {
    try { fs.unlinkSync(traPath); } catch {}
    try { fs.unlinkSync(cmsPath); } catch {}
  }
}

async function callWSAA(cms, env = 'homo') {
  const url = URLS[env];
  const soap = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${cms}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;

  const res = await axios.post(url, soap, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
    },
    timeout: 30_000,
  });

  const parsed = await xml2js.parseStringPromise(res.data, { explicitArray: false });
  const body = parsed['soapenv:Envelope']?.['soapenv:Body'] || parsed['SOAP-ENV:Envelope']?.['SOAP-ENV:Body'];
  const loginReturn = body?.['loginCmsResponse']?.loginCmsReturn;

  if (!loginReturn) throw new Error('WSAA: respuesta inesperada');

  const ticket = await xml2js.parseStringPromise(loginReturn, { explicitArray: false });
  const cred = ticket.loginTicketResponse.credentials;
  return { token: cred.token, sign: cred.sign };
}

/**
 * Obtiene token+sign cacheado o lo renueva si está vencido.
 * @param {string} cuit  CUIT sin guiones
 * @param {string} service  'wsfe' | 'ws_sr_padron_a5'
 * @param {string} env  'homo' | 'prod'
 */
async function getTokenSign(cuit, service, env = 'homo') {
  const cacheFile = path.join(TOKENS_DIR, `${cuit}_${service}_${env}.json`);

  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    if (new Date(cached.expires) > new Date(Date.now() + 5 * 60_000)) {
      return { token: cached.token, sign: cached.sign };
    }
  }

  const certsDir = path.join(__dirname, '..', 'certs', cuit);
  const certPath = path.join(certsDir, 'cert.pem');
  const keyPath = path.join(certsDir, 'key.pem');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    throw new Error(`Certificado no encontrado para CUIT ${cuit}. Subí el certificado desde Mi Perfil.`);
  }

  const tra = buildTRA(service);
  const cms = signTRA(tra, certPath, keyPath);
  const { token, sign } = await callWSAA(cms, env);

  fs.writeFileSync(cacheFile, JSON.stringify({
    token, sign,
    expires: new Date(Date.now() + 10 * 3600_000).toISOString(),
  }));

  return { token, sign };
}

module.exports = { getTokenSign };
