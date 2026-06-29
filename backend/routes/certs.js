/**
 * POST /api/cert/upload
 *   Body: multipart — campo "cert" (.p12) + campo "password" (string) + campo "cuit" (string)
 *   Extrae cert.pem y key.pem del .p12 usando OpenSSL y los guarda en certs/{cuit}/
 *
 * GET /api/cert/status/:cuit
 *   Devuelve si el certificado está cargado y su CN/fecha de vencimiento
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const forge = require('node-forge');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const CERTS_DIR = path.join(__dirname, '..', 'certs');

function certDir(cuit) {
  const dir = path.join(CERTS_DIR, cuit.replace(/-/g, ''));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

router.post('/upload', upload.single('cert'), (req, res) => {
  const { cuit, password } = req.body;
  if (!req.file || !cuit || password === undefined) {
    return res.status(400).json({ error: 'Se requiere el archivo .p12, el CUIT y la contraseña.' });
  }

  const tmpP12 = path.join(os.tmpdir(), `cert_${Date.now()}.p12`);
  const dir = certDir(cuit);
  const certPem = path.join(dir, 'cert.pem');
  const keyPem = path.join(dir, 'key.pem');

  try {
    fs.writeFileSync(tmpP12, req.file.buffer);

    // Extraer certificado (parte pública)
    execSync(
      `openssl pkcs12 -in "${tmpP12}" -clcerts -nokeys -out "${certPem}" -password pass:${password} -legacy 2>&1`,
      { stdio: 'pipe' }
    );

    // Extraer clave privada sin password (guardada con permisos restrictivos)
    execSync(
      `openssl pkcs12 -in "${tmpP12}" -nocerts -nodes -out "${keyPem}" -password pass:${password} -legacy 2>&1`,
      { stdio: 'pipe' }
    );

    // Restringir permisos de la clave privada
    fs.chmodSync(keyPem, 0o600);

    // Leer metadatos del certificado para confirmar
    const certContent = fs.readFileSync(certPem, 'utf8');
    const cert = forge.pki.certificateFromPem(certContent);
    const cn = cert.subject.getField('CN')?.value || 'Sin CN';
    const notAfter = cert.validity.notAfter.toISOString().slice(0, 10);

    res.json({ ok: true, cn, vencimiento: notAfter });
  } catch (err) {
    // Limpiar archivos si falló
    try { fs.unlinkSync(certPem); } catch {}
    try { fs.unlinkSync(keyPem); } catch {}
    const msg = err.stderr?.toString() || err.message || 'Error desconocido';
    if (msg.includes('invalid password') || msg.includes('wrong password') || msg.includes('bad decrypt')) {
      return res.status(400).json({ error: 'Contraseña incorrecta para el certificado.' });
    }
    res.status(500).json({ error: `Error al procesar el certificado: ${msg}` });
  } finally {
    try { fs.unlinkSync(tmpP12); } catch {}
  }
});

router.get('/status/:cuit', (req, res) => {
  const cuit = req.params.cuit.replace(/-/g, '');
  const certPem = path.join(CERTS_DIR, cuit, 'cert.pem');

  if (!fs.existsSync(certPem)) {
    return res.json({ active: false });
  }

  try {
    const certContent = fs.readFileSync(certPem, 'utf8');
    const cert = forge.pki.certificateFromPem(certContent);
    const cn = cert.subject.getField('CN')?.value || 'Sin CN';
    const notAfter = cert.validity.notAfter;
    const vencido = notAfter < new Date();
    res.json({
      active: true,
      cn,
      vencimiento: notAfter.toISOString().slice(0, 10),
      vencido,
    });
  } catch {
    res.json({ active: false });
  }
});

module.exports = router;
