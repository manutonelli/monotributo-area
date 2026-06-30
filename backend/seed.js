/**
 * Carga datos demo en Supabase para un CUIT dado.
 * Uso: node seed.js <cuit> "<nombre>" <categoria> "<estudio>"
 * Ejemplo: node seed.js 27345678901 "María García" C "Estudio XYZ"
 */
require('dotenv').config();
const supabase = require('./supabase');

const [,, cuit, nombre = 'Demo Usuario', categoria = 'C', estudio = 'Estudio Demo'] = process.argv;

if (!cuit) { console.error('Uso: node seed.js <cuit> "<nombre>" <categoria> "<estudio>"'); process.exit(1); }
if (!supabase) { console.error('Configurá SUPABASE_URL y SUPABASE_SERVICE_KEY en .env'); process.exit(1); }

async function seed() {
  // Cliente
  const { error: ce } = await supabase.from('clientes').upsert({
    cuit, nombre, categoria, estudio,
    email: 'demo@email.com', domicilio: 'Av. Corrientes 1234, CABA',
  }, { onConflict: 'cuit' });
  if (ce) { console.error('Error cliente:', ce.message); process.exit(1); }

  // Facturas demo
  const hoy = new Date();
  const facturas = [
    { numero: '0001-00000124', tipo: 'C', cliente_nombre: 'Tech Solutions S.A.',     cliente_cuit: '30-71234567-8', monto: 185000, fecha: '29/04/2026', cae: '74392847163001', vencimiento_cae: '09/05/2026', concepto: 'Servicios de desarrollo web' },
    { numero: '0001-00000123', tipo: 'C', cliente_nombre: 'Consultora ABC S.R.L.',    cliente_cuit: '30-69876543-2', monto: 320000, fecha: '28/04/2026', cae: '74392847163002', vencimiento_cae: '08/05/2026', concepto: 'Consultoría estratégica' },
    { numero: '0001-00000122', tipo: 'C', cliente_nombre: 'García & Asociados',       cliente_cuit: '27-34567890-1', monto: 95000,  fecha: '22/04/2026', cae: '74392847163003', vencimiento_cae: '02/05/2026', concepto: 'Asesoramiento contable' },
    { numero: '0001-00000121', tipo: 'C', cliente_nombre: 'Estudio Creativo',         cliente_cuit: '30-71112223-3', monto: 210000, fecha: '18/04/2026', cae: '74392847163004', vencimiento_cae: '28/04/2026', concepto: 'Diseño y comunicación' },
    { numero: '0001-00000120', tipo: 'C', cliente_nombre: 'Consumidor Final',         cliente_cuit: null,            monto: 45000,  fecha: '15/04/2026', cae: '74392847163005', vencimiento_cae: '25/04/2026', concepto: 'Servicios varios' },
    { numero: '0001-00000119', tipo: 'C', cliente_nombre: 'Marketing Digital S.A.',  cliente_cuit: '30-70009998-7', monto: 280000, fecha: '10/04/2026', cae: '74392847163006', vencimiento_cae: '20/04/2026', concepto: 'Campaña digital abril' },
    { numero: '0001-00000118', tipo: 'C', cliente_nombre: 'Inversiones del Sur S.A.', cliente_cuit: '30-60123456-4', monto: 150000, fecha: '05/04/2026', cae: '74392847163007', vencimiento_cae: '15/04/2026', concepto: 'Servicios profesionales' },
    { numero: '0001-00000117', tipo: 'C', cliente_nombre: 'Constructora Norte S.R.L.', cliente_cuit: '30-55678901-2', monto: 420000, fecha: '28/03/2026', cae: '74392847163008', vencimiento_cae: '07/04/2026', concepto: 'Asesoramiento técnico' },
    { numero: '0001-00000116', tipo: 'C', cliente_nombre: 'Tech Solutions S.A.',     cliente_cuit: '30-71234567-8', monto: 195000, fecha: '20/03/2026', cae: '74392847163009', vencimiento_cae: '30/03/2026', concepto: 'Mantenimiento sistema' },
    { numero: '0001-00000115', tipo: 'C', cliente_nombre: 'Consumidor Final',         cliente_cuit: null,            monto: 38000,  fecha: '15/03/2026', cae: '74392847163010', vencimiento_cae: '25/03/2026', concepto: 'Servicios varios' },
    { numero: '0001-00000114', tipo: 'C', cliente_nombre: 'Consultora ABC S.R.L.',    cliente_cuit: '30-69876543-2', monto: 280000, fecha: '10/03/2026', cae: '74392847163011', vencimiento_cae: '20/03/2026', concepto: 'Consultoría mensual marzo' },
    { numero: '0001-00000113', tipo: 'C', cliente_nombre: 'García & Asociados',       cliente_cuit: '27-34567890-1', monto: 112000, fecha: '03/03/2026', cae: '74392847163012', vencimiento_cae: '13/03/2026', concepto: 'Análisis financiero' },
    { numero: '0001-00000112', tipo: 'C', cliente_nombre: 'Marketing Digital S.A.',  cliente_cuit: '30-70009998-7', monto: 310000, fecha: '25/02/2026', cae: '74392847163013', vencimiento_cae: '07/03/2026', concepto: 'Campaña digital febrero' },
    { numero: '0001-00000111', tipo: 'C', cliente_nombre: 'Estudio Creativo',         cliente_cuit: '30-71112223-3', monto: 200000, fecha: '18/02/2026', cae: '74392847163014', vencimiento_cae: '28/02/2026', concepto: 'Rediseño corporativo' },
  ].map(f => ({ ...f, cuit_emisor: cuit }));

  const { error: fe } = await supabase.from('facturas').upsert(facturas, { onConflict: 'cuit_emisor,numero' });
  if (fe) { console.error('Error facturas:', fe.message); process.exit(1); }

  // VEPs demo
  const { error: ve } = await supabase.from('veps').upsert([
    { cuit, periodo: '04/2026', numero: '72.845.001', monto: 42830, codigo: '0110250427000000000012893745000000004283000', estado: 'pagado',   vencimiento: '20/04/2026' },
    { cuit, periodo: '03/2026', numero: '72.844.900', monto: 42830, codigo: '0110250327000000000012893745000000004283000', estado: 'pagado',   vencimiento: '20/03/2026' },
  ], { onConflict: 'id', ignoreDuplicates: true });
  if (ve) console.warn('VEPs (puede ser duplicado):', ve.message);

  // Pagos
  const { error: pe } = await supabase.from('pagos_monotributo').upsert([
    { cuit, periodo: '04/2026', monto: 42830, estado: 'pagado',   fecha_pago: '18/04/2026' },
    { cuit, periodo: '03/2026', monto: 42830, estado: 'pagado',   fecha_pago: '19/03/2026' },
    { cuit, periodo: '05/2026', monto: 42830, estado: 'pendiente', fecha_pago: null },
  ], { onConflict: 'cuit,periodo' });
  if (pe) console.warn('Pagos (puede ser duplicado):', pe.message);

  console.log(`✓ Datos demo cargados para CUIT ${cuit} (${nombre})`);
}

seed().catch(err => { console.error(err); process.exit(1); });
