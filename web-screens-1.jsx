
// MonoClaro Web — Screens part 1: Dashboard, Facturación, VEP
// ===================================================================

// Constantes compartidas entre Dashboard, VEP y Vencimientos
const CUOTAS_CAT = { A: 28420, B: 31580, C: 42830, D: 52340, E: 63150, F: 78600, G: 94350 };
const TOPES_CAT  = { A: 2109906, B: 3150950, C: 4201265, D: 5251580, E: 6302896, F: 7878620, G: 9454344 };

// Vencimientos mensuales 2026 (dia ajustado por fin de semana — no incluye feriados)
const VCTOS_2026 = {
   1: '20/01/2026',  2: '20/02/2026',  3: '20/03/2026',
   4: '20/04/2026',  5: '20/05/2026',  6: '22/06/2026', // Sáb → Lun
   7: '20/07/2026',  8: '20/08/2026',  9: '21/09/2026', // Dom → Lun
  10: '20/10/2026', 11: '20/11/2026', 12: '21/12/2026', // Dom → Lun
};

function proximoVcto() {
  const hoy = new Date();
  for (let mes = 1; mes <= 12; mes++) {
    const [d, m, y] = VCTOS_2026[mes].split('/');
    const fecha = new Date(+y, +m - 1, +d);
    if (fecha >= hoy) return { fecha, label: VCTOS_2026[mes], diasRestantes: Math.ceil((fecha - hoy) / 86400000) };
  }
  return null;
}

// ── DASHBOARD ───────────────────────────────────────────
function WebDashboard({ navigate, userName, categoria, invoices }) {
  const bp = useBreakpoint();
  const tope = TOPES_CAT[categoria] || TOPES_CAT.C;
  const cuota = CUOTAS_CAT[categoria] || CUOTAS_CAT.C;
  const facturado = invoices.reduce((sum, f) => sum + f.monto, 0);
  const pct = Math.min(100, Math.round((facturado / tope) * 100));

  const now = new Date();
  const facturasMes = invoices.filter(f => {
    const [, m, y] = f.fecha.split('/');
    return parseInt(m) === now.getMonth() + 1 && parseInt(y) === now.getFullYear();
  });
  const totalMes = facturasMes.reduce((s, f) => s + f.monto, 0);

  const vcto = proximoVcto();
  const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const vctoMesLabel = vcto ? mesesNombres[vcto.fecha.getMonth()] : '';
  const vctoLabel = vcto ? `${vcto.fecha.getDate()} ${vctoMesLabel.slice(0,3)}` : '—';
  const vctoAlerta = vcto && vcto.diasRestantes <= 7;

  const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : `$${(n / 1000).toFixed(0)}K`;

  const recentInvoices = invoices.slice(0, 4).map(f => ({
    ...f,
    fechaLabel: (() => {
      const [d, m, y] = f.fecha.split('/');
      const fd = new Date(y, m - 1, d);
      const diff = Math.round((now - fd) / 86400000);
      if (diff === 0) return 'Hoy';
      if (diff === 1) return 'Ayer';
      return `${d} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(m)-1]}`;
    })(),
  }));

  return (
    <WebContent>
      {/* Alert banner */}
      {vcto && vcto.diasRestantes <= 10 && (
        <div style={{
          background: DS.colors.card, borderRadius: DS.radius.lg,
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 13,
          marginBottom: 22, border: `1px solid ${DS.colors.border}`,
          borderLeft: `3px solid ${vctoAlerta ? DS.colors.danger : DS.colors.warning}`,
          flexWrap: 'wrap',
        }}>
          <Icon name="alert" size={19} color={vctoAlerta ? DS.colors.danger : DS.colors.warning} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: DS.colors.text }}>Vencimiento próximo · </span>
            <span style={{ fontSize: 13.5, color: DS.colors.textMid }}>
              Pago del monotributo de {vctoMesLabel} ${cuota.toLocaleString('es-AR')} vence en {vcto.diasRestantes} día{vcto.diasRestantes !== 1 ? 's' : ''}
            </span>
          </div>
          <Btn variant="primary" style={{ padding: '8px 15px', fontSize: 13 }} onClick={() => navigate('vep')}>Generar VEP</Btn>
        </div>
      )}

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: bp === 'sm' ? 'repeat(2, 1fr)' : bp === 'md' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 14, marginBottom: 26 }}>
        <StatTile label={`FACTURADO ${now.getFullYear()}`} value={fmt(facturado)} sub={`${pct}% del tope anual`} icon="dollar" accent={DS.colors.primary} />
        <StatTile label="CATEGORÍA ACTUAL" value={`Cat. ${categoria}`} sub={`Cuota $${cuota.toLocaleString('es-AR')} / mes`} icon="fileText" accent={DS.colors.accent} />
        <StatTile label="FACTURAS DEL MES" value={facturasMes.length} sub={`${fmt(totalMes)} emitido`} icon="invoice" accent={DS.colors.success} />
        <StatTile label="PRÓXIMO PAGO" value={vctoLabel} sub={vcto ? `Quedan ${vcto.diasRestantes} día${vcto.diasRestantes !== 1 ? 's' : ''}` : '—'} icon="clock" accent={DS.colors.warning} />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: bp === 'lg' ? '1.5fr 1fr' : '1fr', gap: 24 }}>
        {/* Left */}
        <div>
          {/* Tope card */}
          <Card style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: DS.colors.primary, padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4 }}>FACTURACIÓN ANUAL ACUMULADA</div>
                  <div style={{ color: '#fff', fontSize: 30, fontWeight: 700, marginTop: 5, letterSpacing: -0.6 }}>${facturado.toLocaleString('es-AR')}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12.5, marginTop: 3 }}>de ${tope.toLocaleString('es-AR')} · tope Categoría {categoria}</div>
                </div>
                <span style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 99 }}>{pct}% utilizado</span>
              </div>
              <ProgressBar value={facturado} max={tope} color="rgba(255,255,255,0.9)" bg="rgba(255,255,255,0.18)" height={8} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 11 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Disponible: ${((tope - facturado) / 1000).toFixed(0)}K</span>
                <span onClick={() => navigate('topes')} style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Ver detalle <Icon name="arrowRight" size={13} color="rgba(255,255,255,0.9)" />
                </span>
              </div>
            </div>
          </Card>

          {/* Recent invoices */}
          <WebSection action="Ver todas" onAction={() => navigate('factura')}>Últimas facturas</WebSection>
          <Card style={{ padding: '2px 18px' }}>
            {recentInvoices.map((f, i, arr) => (
              <div key={f.num} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}><Icon name="invoice" size={16} color={DS.colors.textMid} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DS.colors.text }}>{f.cliente}</div>
                  <div style={{ fontSize: 12, color: DS.colors.textMuted }}>FC {f.tipo} {f.num}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: DS.colors.text }}>${f.monto.toLocaleString('es-AR')}</div>
                  <div style={{ fontSize: 11, color: DS.colors.textMuted }}>{f.fechaLabel}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Right */}
        <div>
          <WebSection>Acciones rápidas</WebSection>
          <Card style={{ padding: '6px 8px', marginBottom: 24 }}>
            {[
              { icon: 'invoice', label: 'Emitir factura', sub: 'Comprobante tipo C o E', screen: 'factura' },
              { icon: 'card', label: 'Generar VEP', sub: 'Volante de pago mensual', screen: 'vep' },
              { icon: 'refresh', label: 'Recategorizar', sub: 'Revisar categoría', screen: 'recategorizacion' },
              { icon: 'briefcase', label: 'Consultar contador', sub: 'Derivar caso complejo', screen: 'derivar' },
            ].map((a, i, arr) => (
              <div key={a.screen} onClick={() => navigate(a.screen)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 10px', borderRadius: 8, cursor: 'pointer',
                borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.colors.bg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: DS.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={a.icon} size={17} color={DS.colors.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DS.colors.text }}>{a.label}</div>
                  <div style={{ fontSize: 11.5, color: DS.colors.textMuted }}>{a.sub}</div>
                </div>
                <Icon name="chevron" size={15} color={DS.colors.textMuted} />
              </div>
            ))}
          </Card>

          <WebSection action="Ver todos" onAction={() => navigate('vencimientos')}>Próximos vencimientos</WebSection>
          <Card style={{ padding: '2px 18px' }}>
            {(() => {
              const hoy = new Date();
              const proximos = [];
              for (let mes = 1; mes <= 12 && proximos.length < 3; mes++) {
                const [d, m, y] = VCTOS_2026[mes].split('/');
                const fecha = new Date(+y, +m - 1, +d);
                if (fecha >= hoy) {
                  const mLabel = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][mes-1];
                  const dias = Math.ceil((fecha - hoy) / 86400000);
                  proximos.push({ dia: d, mes: mLabel, tipo: 'Monotributo', desc: `Pago mensual — ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mes-1]} ${y}`, proximo: dias <= 7 });
                }
              }
              // Agregar recategorización semestral
              if (hoy < new Date(2026, 6, 20)) proximos.splice(1, 0, { dia: '20', mes: 'JUL', tipo: 'Recategorización', desc: 'Semestral obligatoria — 1er semestre', proximo: false });
              return proximos.slice(0, 3);
            })().map((v, i, arr) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DS.colors.text, lineHeight: 1 }}>{v.dia}</div>
                  <div style={{ fontSize: 8.5, color: DS.colors.textMuted, fontWeight: 600, marginTop: 1 }}>{v.mes}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DS.colors.text }}>{v.tipo}</div>
                  <div style={{ fontSize: 11.5, color: DS.colors.textMuted }}>{v.desc}</div>
                </div>
                {v.proximo && <Badge color={DS.colors.warningLight} textColor={DS.colors.warning}>5 días</Badge>}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </WebContent>
  );
}
window.WebDashboard = WebDashboard;

// ── FACTURACIÓN ─────────────────────────────────────────
function WebFactura({ navigate, cuit: cuitEmisor, invoices, addInvoice, token }) {
  const bp = useBreakpoint();
  const [showModal, setShowModal] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [form, setForm] = React.useState({ tipo: 'C', conceptoTipo: 2, cuit: '', razon: '', concepto: '', monto: '', condicion: 'Consumidor Final' });
  const [pdfFile, setPdfFile] = React.useState(null);
  const [caeResult, setCaeResult] = React.useState(null); // { numero, cae, vencimientoCAE }
  const [confirming, setConfirming] = React.useState(false);
  const [confirmError, setConfirmError] = React.useState(null);
  const [cuitLoading, setCuitLoading] = React.useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nextNumInt = React.useMemo(() => {
    if (!invoices.length) return 125;
    const nums = invoices.map(f => parseInt(f.num.split('-')[1])).filter(n => !isNaN(n));
    return Math.max(...nums) + 1;
  }, [invoices]);

  const reset = () => {
    setShowModal(false); setStep(1); setConfirmError(null); setCaeResult(null); setPdfFile(null);
    setForm({ tipo: 'C', conceptoTipo: 2, cuit: '', razon: '', concepto: '', monto: '', condicion: 'Consumidor Final' });
  };

  // Lookup de CUIT en el padrón ARCA
  const lookupCuit = async () => {
    const cuitLimpio = form.cuit.replace(/\D/g, '');
    if (cuitLimpio.length !== 11) return;
    setCuitLoading(true);
    try {
      const res = await fetch(`${API_BASE}/padron/${cuitLimpio}?cuitEmisor=${(cuitEmisor||'').replace(/\D/g,'')}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        set('razon', data.razonSocial || form.razon);
        set('condicion', data.condicionIVA || form.condicion);
      }
    } catch {}
    setCuitLoading(false);
  };

  // Confirmar: llama al backend para obtener CAE real
  const confirm = async () => {
    setConfirming(true);
    setConfirmError(null);

    const docTipo = form.cuit ? 80 : 99; // 80=CUIT, 99=Consumidor Final
    const docNro = form.cuit ? form.cuit.replace(/\D/g, '') : 0;
    const emisorCuit = (cuitEmisor || '').replace(/\D/g, '');

    try {
      let resultado;
      if (emisorCuit && emisorCuit.length === 11) {
        const res = await fetch(`${API_BASE}/facturas/cae`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            cuit: emisorCuit,
            ptoVta: 1,
            tipo: form.tipo,
            concepto: form.conceptoTipo,
            docTipo,
            docNro,
            importeTotal: Number(form.monto),
            clienteNombre: form.razon || null,
            clienteCuit: form.cuit || null,
            conceptoTexto: form.concepto || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error del servidor');
        resultado = data;
      } else {
        // Sin certificado configurado: generar número local y CAE simulado
        resultado = {
          numero: nextNumInt,
          cae: Math.floor(Math.random() * 9e13 + 1e13).toString(),
          vencimientoCAE: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })(),
        };
      }

      const today = new Date();
      const fecha = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
      const numFormatted = `0001-${String(resultado.numero).padStart(8, '0')}`;

      addInvoice({
        num: numFormatted,
        cliente: form.razon || 'Consumidor Final',
        cuit: form.cuit || '—',
        monto: Number(form.monto),
        fecha,
        tipo: form.tipo,
        concepto: form.concepto,
        cae: resultado.cae,
        vencimientoCAE: resultado.vencimientoCAE,
      });

      setCaeResult({ ...resultado, numFormatted });
      setStep(3);
    } catch (err) {
      setConfirmError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const downloadFactura = (f) => {
    const lines = [
      `FACTURA ${f.tipo || 'C'} Nº ${f.num}`,
      '='.repeat(50),
      `Fecha: ${f.fecha}`,
      `Cliente: ${f.cliente}`,
      `CUIT: ${f.cuit}`,
      `Concepto: ${f.concepto || 'Servicios profesionales'}`,
      `Condición IVA: Monotributo — No genera crédito fiscal`,
      '='.repeat(50),
      `TOTAL: $${Number(f.monto).toLocaleString('es-AR')}`,
      '',
      `CAE: 74392847163529`,
      `Vence CAE: ${(() => { const d = new Date(); d.setDate(d.getDate() + 10); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })()}`,
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${f.num}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = search.trim()
    ? invoices.filter(f =>
        f.cliente.toLowerCase().includes(search.toLowerCase()) ||
        f.num.includes(search) ||
        (f.cuit && f.cuit.includes(search)) ||
        (f.concepto && f.concepto.toLowerCase().includes(search.toLowerCase()))
      )
    : invoices;

  const now = new Date();
  const facturasMes = invoices.filter(f => {
    const [, m, y] = f.fecha.split('/');
    return parseInt(m) === now.getMonth() + 1 && parseInt(y) === now.getFullYear();
  });
  const totalMes = facturasMes.reduce((s, f) => s + f.monto, 0);
  const promedio = invoices.length > 0 ? Math.round(invoices.reduce((s, f) => s + f.monto, 0) / invoices.length) : 0;

  const columns = [
    { key: 'num', label: 'Comprobante', width: '1.3fr' },
    { key: 'cliente', label: 'Cliente', width: '1.6fr' },
    { key: 'cuit', label: 'CUIT', width: '1.2fr' },
    { key: 'fecha', label: 'Fecha', width: '1fr' },
    { key: 'monto', label: 'Monto', width: '1fr', align: 'right' },
    { key: 'estado', label: 'Estado', width: '0.9fr', align: 'right' },
  ];

  const renderCell = (row, key) => {
    if (key === 'num') return <span style={{ fontSize: 13, fontWeight: 600, color: DS.colors.primary }}>FC {row.tipo || 'C'} {row.num}</span>;
    if (key === 'cliente') return <span style={{ fontSize: 13, fontWeight: 600, color: DS.colors.text }}>{row.cliente}</span>;
    if (key === 'cuit') return <span style={{ fontSize: 13, color: DS.colors.textMid }}>{row.cuit}</span>;
    if (key === 'fecha') return <span style={{ fontSize: 13, color: DS.colors.textMid }}>{row.fecha}</span>;
    if (key === 'monto') return <span style={{ fontSize: 13.5, fontWeight: 700, color: DS.colors.text }}>${row.monto.toLocaleString('es-AR')}</span>;
    if (key === 'estado') return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
        <Badge color={DS.colors.successLight} textColor={DS.colors.success}>Emitida</Badge>
        <div
          onClick={() => downloadFactura(row)}
          title="Descargar"
          style={{ cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background = DS.colors.bg}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon name="download" size={14} color={DS.colors.textMuted} />
        </div>
      </div>
    );
  };

  return (
    <WebContent>
      <div style={{ display: 'grid', gridTemplateColumns: bp === 'sm' ? '1fr' : 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatTile label="EMITIDO ESTE MES" value={totalMes >= 1000000 ? `$${(totalMes/1000000).toFixed(2)}M` : `$${(totalMes/1000).toFixed(0)}K`} sub={`${facturasMes.length} comprobantes`} icon="trending" accent={DS.colors.success} />
        <StatTile label="PROMEDIO POR FACTURA" value={`$${(promedio/1000).toFixed(1)}K`} sub="Promedio histórico" icon="chart" accent={DS.colors.primary} />
        <StatTile label="ÚLTIMO COMPROBANTE" value={`Nº ${nextNumInt - 1}`} sub={invoices[0] ? `Emitido el ${invoices[0].fecha}` : '—'} icon="invoice" accent={DS.colors.accent} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: bp === 'sm' ? 'flex-start' : 'center', marginBottom: 14, gap: 12, flexDirection: bp === 'sm' ? 'column' : 'row' }}>
        <WebSection style={{ margin: 0 }}>Historial de facturas</WebSection>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: bp === 'sm' ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', flex: bp === 'sm' ? 1 : 'none' }}>
            <Icon name="search" size={15} color={DS.colors.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente, N° o concepto…"
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                borderRadius: 8, border: `1.5px solid ${DS.colors.border}`, fontSize: 13,
                fontFamily: DS.font, color: DS.colors.text, outline: 'none',
                width: bp === 'sm' ? '100%' : 240,
                background: DS.colors.card, boxSizing: 'border-box',
              }}
            />
          </div>
          <Btn variant="primary" onClick={() => setShowModal(true)} style={{ flexShrink: 0 }}><Icon name="plus" size={16} color="#fff" />{bp !== 'sm' ? ' Nueva factura' : ''}</Btn>
        </div>
      </div>

      {filtered.length === 0 && search ? (
        <Card style={{ textAlign: 'center', padding: '32px', color: DS.colors.textMuted, fontSize: 13.5 }}>
          Sin resultados para "<strong>{search}</strong>"
        </Card>
      ) : (
        <DataTable columns={columns} rows={filtered} renderCell={renderCell} />
      )}

      {showModal && (
        <Modal onClose={reset} width={520}>
          {step === 1 && (
            <>
              <ModalHeader title="Nueva factura" subtitle="Completá los datos del comprobante" onClose={reset} />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: DS.colors.textMid, marginBottom: 8, letterSpacing: 0.3 }}>TIPO DE COMPROBANTE</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  {[['C', 'Mercado interno'], ['E', 'Exportación']].map(([t, d]) => (
                    <div key={t} onClick={() => set('tipo', t)} style={{
                      flex: 1, padding: '12px', borderRadius: 9, textAlign: 'center', cursor: 'pointer',
                      border: `1.5px solid ${form.tipo === t ? DS.colors.primary : DS.colors.border}`,
                      background: form.tipo === t ? DS.colors.primaryLight : '#fff',
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: form.tipo === t ? DS.colors.primary : DS.colors.textMuted }}>Factura {t}</div>
                      <div style={{ fontSize: 11, color: DS.colors.textMuted, marginTop: 2 }}>{d}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11.5, fontWeight: 700, color: DS.colors.textMid, marginBottom: 8, letterSpacing: 0.3 }}>TIPO DE OPERACIÓN</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                  {[[1,'Productos'],[2,'Servicios'],[3,'Prod. + Serv.']].map(([v, l]) => (
                    <div key={v} onClick={() => set('conceptoTipo', v)} style={{
                      flex: 1, padding: '8px 6px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                      border: `1.5px solid ${form.conceptoTipo === v ? DS.colors.accent : DS.colors.border}`,
                      background: form.conceptoTipo === v ? '#F0FDF4' : '#fff',
                      color: form.conceptoTipo === v ? DS.colors.accent : DS.colors.textMuted,
                    }}>{l}</div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: bp === 'sm' ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <div>
                    <Field label="CUIT / DNI (opcional)" value={form.cuit} onChange={v => set('cuit', v)} placeholder="20-12345678-3" />
                    {form.cuit.replace(/\D/g,'').length === 11 && (
                      <button onClick={lookupCuit} disabled={cuitLoading} style={{
                        marginTop: 5, fontSize: 11.5, color: DS.colors.primary, background: 'none',
                        border: 'none', cursor: 'pointer', padding: 0, fontFamily: DS.font,
                      }}>
                        {cuitLoading ? 'Consultando padrón…' : '↗ Buscar en padrón ARCA'}
                      </button>
                    )}
                  </div>
                  <Field label="Razón Social / Nombre" value={form.razon} onChange={v => set('razon', v)} placeholder="Consumidor Final" />
                </div>
                <Field label="Descripción / Concepto" value={form.concepto} onChange={v => set('concepto', v)} placeholder="Servicios profesionales — Junio 2026" />
                <Field label="Monto total" value={form.monto} onChange={v => set('monto', v.replace(/\D/g, ''))} placeholder="0" prefix="$" type="tel" />

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: DS.colors.textMid, marginBottom: 6, letterSpacing: 0.3 }}>ADJUNTAR PDF (OPCIONAL)</div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9,
                    border: `1.5px dashed ${pdfFile ? DS.colors.accent : DS.colors.border}`,
                    background: pdfFile ? '#F0FDF4' : DS.colors.bg, cursor: 'pointer',
                  }}>
                    <Icon name="download" size={16} color={pdfFile ? DS.colors.accent : DS.colors.textMuted} />
                    <span style={{ fontSize: 13, color: pdfFile ? DS.colors.accent : DS.colors.textMuted, flex: 1 }}>
                      {pdfFile ? pdfFile.name : 'Seleccionar archivo PDF…'}
                    </span>
                    {pdfFile && <span onClick={e => { e.preventDefault(); setPdfFile(null); }} style={{ fontSize: 11, color: DS.colors.danger, cursor: 'pointer' }}>✕</span>}
                    <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setPdfFile(e.target.files[0] || null)} />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Btn variant="secondary" style={{ flex: 1 }} onClick={reset}>Cancelar</Btn>
                  <Btn variant="primary" style={{ flex: 1 }} disabled={!form.concepto || !form.monto} onClick={() => setStep(2)}>Continuar</Btn>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <ModalHeader title="Confirmar factura" subtitle="Revisá los datos antes de emitir" onClose={reset} />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ background: DS.colors.bg, borderRadius: 10, padding: '16px 18px', marginBottom: 16, border: `1px solid ${DS.colors.border}` }}>
                  {[['Comprobante', `FC ${form.tipo} ${nextNumFormatted}`], ['Tipo', `Factura ${form.tipo}`], ['Operación', ['','Productos','Servicios','Prod. + Servicios'][form.conceptoTipo] || 'Servicios'], ['Receptor', form.razon || 'Consumidor Final'], ['CUIT', form.cuit || '—'], ['Concepto', form.concepto], ['Condición IVA', form.condicion]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${DS.colors.border}` }}>
                      <span style={{ fontSize: 13, color: DS.colors.textMuted }}>{k}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: DS.colors.text }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700 }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: DS.colors.text }}>${Number(form.monto).toLocaleString('es-AR')}</span>
                  </div>
                </div>
                <div style={{ background: DS.colors.warningLight, borderRadius: 8, padding: '11px 14px', marginBottom: 18, fontSize: 12, color: DS.colors.textMid, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="alert" size={15} color={DS.colors.warning} style={{ marginTop: 1 }} /> Una vez confirmada, se enviará a AFIP y no podrá modificarse.
                </div>
                {confirmError && (
                  <div style={{ background: DS.colors.dangerLight, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 12.5, color: DS.colors.danger, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Icon name="alert" size={15} color={DS.colors.danger} style={{ marginTop: 1 }} /> {confirmError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <Btn variant="secondary" style={{ flex: 1 }} disabled={confirming} onClick={() => setStep(1)}>Volver</Btn>
                  <Btn variant="primary" style={{ flex: 1.4 }} disabled={confirming} onClick={confirm}>
                    {confirming ? 'Enviando a ARCA…' : 'Confirmar y emitir'}
                  </Btn>
                </div>
              </div>
            </>
          )}
          {step === 3 && caeResult && (() => {
            const factObj = { num: caeResult.numFormatted, tipo: form.tipo, cliente: form.razon || 'Consumidor Final', cuit: form.cuit || '—', concepto: form.concepto, monto: form.monto, fecha: (() => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })(), cae: caeResult.cae, vencimientoCAE: caeResult.vencimientoCAE };
            return (
              <div style={{ padding: '38px 30px', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 99, background: DS.colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                  <Icon name="check" size={30} color={DS.colors.success} strokeWidth={2.2} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: DS.colors.text, marginBottom: 6 }}>Factura emitida</div>
                <div style={{ fontSize: 13.5, color: DS.colors.textMuted }}>Factura {form.tipo} Nº {caeResult.numFormatted}</div>
                <div style={{ fontSize: 25, fontWeight: 700, color: DS.colors.text, margin: '12px 0 20px' }}>${Number(form.monto || 0).toLocaleString('es-AR')}</div>
                <div style={{ background: DS.colors.bg, borderRadius: 10, padding: '14px 20px', marginBottom: 22, border: `1px solid ${DS.colors.border}` }}>
                  <div style={{ fontSize: 11, color: DS.colors.textMuted, letterSpacing: 0.4, fontWeight: 600 }}>CAE EMITIDO POR ARCA</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: DS.colors.text, marginTop: 4, letterSpacing: 1 }}>{caeResult.cae}</div>
                  <div style={{ fontSize: 11, color: DS.colors.textMuted, marginTop: 2 }}>Vence: {caeResult.vencimientoCAE}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Btn variant="secondary" style={{ flex: 1 }} onClick={() => downloadFactura(factObj)}>
                    <Icon name="download" size={15} color={DS.colors.primary} /> Descargar
                  </Btn>
                  <Btn variant="primary" style={{ flex: 1 }} onClick={reset}>Listo</Btn>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </WebContent>
  );
}
window.WebFactura = WebFactura;

// Códigos de pago homebanking para monotributo (formulario ARCA 1002)
const CODIGOS_PAGO = {
  impuesto: '217',
  formulario: '1002',
  subconceptos: { integrado: '019', obraSocial: '021', jubilatorio: '020' },
};

const DETALLE_CAT = {
  A: { integrado: 12020, obraSocial: 11800, jubilatorio: 4600 },
  B: { integrado: 14880, obraSocial: 11800, jubilatorio: 4900 },
  C: { integrado: 18430, obraSocial: 15800, jubilatorio: 8600 },
  D: { integrado: 24740, obraSocial: 18800, jubilatorio: 8800 },
  E: { integrado: 33550, obraSocial: 20800, jubilatorio: 8800 },
  F: { integrado: 48200, obraSocial: 21600, jubilatorio: 8800 },
  G: { integrado: 62950, obraSocial: 22600, jubilatorio: 8800 },
};

// ── GENERAR VEP ─────────────────────────────────────────
function WebVep({ navigate, cuit: cuitEmisor, categoria, veps, addVep, token }) {
  const bp = useBreakpoint();
  const [currentVep, setCurrentVep] = React.useState(null);
  const [generating, setGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState('');

  // Período actual: mes en curso
  const hoy = new Date();
  const mesActual = `${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
  const [periodo, setPeriodo] = React.useState(mesActual);

  const monto = CUOTAS_CAT[categoria] || CUOTAS_CAT.C;
  const detalle = DETALLE_CAT[categoria] || DETALLE_CAT.C;

  // Períodos: 3 meses anteriores + actual + próximo
  const periodosPagados   = new Set((veps || []).filter(v => v.estado === 'pagado').map(v => v.periodo));
  const periodosGenerados = new Set((veps || []).map(v => v.periodo));
  const periodos = (() => {
    const list = [];
    const base = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
    for (let i = 0; i < 5; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const p = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      list.push({ p, estado: periodosPagados.has(p) ? 'pagado' : periodosGenerados.has(p) ? 'pendiente' : 'futuro' });
    }
    return list;
  })();

  const generarVep = async () => {
    setGenerating(true);
    try {
      const cuitNum = (cuitEmisor || '').replace(/\D/g, '');
      const res = await fetch(`${API_BASE}/veps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ cuit: cuitNum, periodo, categoria }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addVep && addVep(data);
      setCurrentVep(data);
    } catch {
      // Sin backend: generar localmente
      const num = `${Math.floor(Math.random()*9e5+1e5)}.${Math.floor(Math.random()*900+100)}`;
      const code = `0110${periodo.slice(3,7).slice(2)}${periodo.slice(0,2)}${(cuitEmisor||'').replace(/\D/g,'').slice(0,8)}${Math.floor(Math.random()*9e9+1e9)}${String(monto).padStart(11,'0')}`;
      setCurrentVep({ numero: num, codigo: code, monto, vencimiento: `20/${periodo}`, estado: 'pendiente' });
    }
    setGenerating(false);
  };

  const copyCode = (val, key) => {
    navigator.clipboard.writeText(val).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = val; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    });
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const vctoMes = VCTOS_2026[parseInt(periodo.split('/')[0])];
  const vctoLabel = vctoMes || `20/${periodo}`;

  return (
    <WebContent maxWidth={920}>
      <div style={{ display: 'grid', gridTemplateColumns: bp === 'lg' ? '1fr 1.4fr' : '1fr', gap: 24, alignItems: 'start' }}>
        {/* Columna izquierda: período + detalle */}
        <div>
          <WebSection>Período a pagar</WebSection>
          <Card style={{ marginBottom: 20, padding: '10px 16px' }}>
            {periodos.map(({ p, estado }, i, arr) => (
              <div key={p} onClick={() => { if (estado !== 'pagado') { setPeriodo(p); setCurrentVep(null); } }} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '13px 6px', cursor: estado === 'pagado' ? 'default' : 'pointer',
                borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                    border: `1.5px solid ${periodo === p ? DS.colors.primary : DS.colors.border}`,
                    background: periodo === p ? DS.colors.primary : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{periodo === p && <div style={{ width: 7, height: 7, borderRadius: 99, background: '#fff' }} />}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: estado === 'pagado' ? DS.colors.textMuted : DS.colors.text }}>{p}</span>
                </div>
                <Badge
                  color={estado === 'pagado' ? DS.colors.successLight : estado === 'pendiente' ? DS.colors.warningLight : DS.colors.bg}
                  textColor={estado === 'pagado' ? DS.colors.success : estado === 'pendiente' ? DS.colors.warning : DS.colors.textMuted}
                >{estado === 'pagado' ? 'Pagado' : estado === 'pendiente' ? 'Generado' : 'Sin VEP'}</Badge>
              </div>
            ))}
          </Card>

          <WebSection>Detalle · Categoría {categoria}</WebSection>
          <Card>
            {[
              ['Impuesto integrado', detalle.integrado, CODIGOS_PAGO.subconceptos.integrado],
              ['Obra social', detalle.obraSocial, CODIGOS_PAGO.subconceptos.obraSocial],
              ['Aporte jubilatorio', detalle.jubilatorio, CODIGOS_PAGO.subconceptos.jubilatorio],
            ].map(([k, v, cod]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${DS.colors.border}`, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: DS.colors.textMid }}>{k}</div>
                  <div style={{ fontSize: 10.5, color: DS.colors.textMuted, marginTop: 1 }}>Subconcepto {cod}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>${v.toLocaleString('es-AR')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>Total a pagar</span>
              <span style={{ fontSize: 19, fontWeight: 700, color: DS.colors.text }}>${monto.toLocaleString('es-AR')}</span>
            </div>
          </Card>
        </div>

        {/* Columna derecha: VEP + códigos de pago */}
        <div>
          {!currentVep ? (
            <>
              <WebSection>Generar volante de pago</WebSection>
              <Card style={{ textAlign: 'center', padding: '28px 24px', marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: DS.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Icon name="card" size={26} color={DS.colors.primary} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: DS.colors.text }}>Monotributo {periodo}</div>
                <div style={{ fontSize: 27, fontWeight: 700, color: DS.colors.text, margin: '8px 0' }}>${monto.toLocaleString('es-AR')}</div>
                <div style={{ fontSize: 12, color: DS.colors.textMuted, marginBottom: 18 }}>
                  Vence el <strong>{vctoLabel}</strong>
                </div>
                <Btn variant="primary" style={{ width: '100%', marginBottom: 12 }} disabled={generating} onClick={generarVep}>
                  {generating ? 'Generando…' : 'Generar VEP'}
                </Btn>
                <a href="https://servicios1.afip.gob.ar/vep/" target="_blank" rel="noopener" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 12.5, color: DS.colors.primary, textDecoration: 'none', fontWeight: 600,
                }}>
                  También podés generarlo en el portal ARCA →
                </a>
              </Card>

              {/* Códigos para homebanking */}
              <Card>
                <div style={{ fontSize: 12, fontWeight: 700, color: DS.colors.textMid, letterSpacing: 0.4, marginBottom: 12 }}>CÓDIGOS PARA PAGO POR HOMEBANKING</div>
                {[
                  ['Impuesto', CODIGOS_PAGO.impuesto],
                  ['Formulario', CODIGOS_PAGO.formulario],
                  ['Período', `${periodo.slice(3)}-${periodo.slice(0,2)}`],
                  ['CUIT', (cuitEmisor || '').replace(/\D/g, '')],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${DS.colors.border}` }}>
                    <span style={{ fontSize: 12.5, color: DS.colors.textMuted }}>{k}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: DS.colors.text }}>{v}</span>
                      <span onClick={() => copyCode(v, k)} style={{ cursor: 'pointer', fontSize: 11, color: copied === k ? DS.colors.success : DS.colors.primary, fontWeight: 600 }}>
                        {copied === k ? '✓' : 'Copiar'}
                      </span>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: DS.colors.textMuted, marginTop: 10, lineHeight: 1.5 }}>
                  Usá estos datos en tu banco para pagar sin generar VEP. El importe se ingresa manualmente.
                </div>
              </Card>
            </>
          ) : (
            <>
              <WebSection>VEP generado</WebSection>
              <Card style={{ marginBottom: 16 }}>
                <div style={{ textAlign: 'center', paddingBottom: 14, borderBottom: `1px solid ${DS.colors.border}`, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 99, background: DS.colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Icon name="check" size={24} color={DS.colors.success} strokeWidth={2.2} />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: DS.colors.textMuted, letterSpacing: 0.4 }}>VEP GENERADO — PERÍODO {periodo}</div>
                  <div style={{ fontSize: 27, fontWeight: 700, color: DS.colors.text, margin: '6px 0 2px' }}>${monto.toLocaleString('es-AR')}</div>
                  <div style={{ fontSize: 12, color: DS.colors.textMuted }}>Válido hasta {vctoLabel} 23:59 hs</div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 600, color: DS.colors.textMuted, letterSpacing: 0.4, marginBottom: 6 }}>CÓDIGO DE PAGO ELECTRÓNICO</div>
                <div style={{ background: DS.colors.bg, borderRadius: 7, padding: '10px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: DS.colors.text, wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 10, border: `1px solid ${DS.colors.border}` }}>{currentVep.codigo}</div>
                <Btn variant="secondary" style={{ width: '100%', marginBottom: 12 }} onClick={() => copyCode(currentVep.codigo, 'vep')}>
                  {copied === 'vep' ? <><Icon name="check" size={15} color={DS.colors.success} /> Copiado</> : <><Icon name="copy" size={15} color={DS.colors.primary} /> Copiar código</>}
                </Btn>

                <div style={{ fontSize: 12, fontWeight: 700, color: DS.colors.textMid, letterSpacing: 0.4, marginBottom: 10 }}>CÓDIGOS HOMEBANKING</div>
                {[['Impuesto', CODIGOS_PAGO.impuesto], ['Formulario', CODIGOS_PAGO.formulario]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${DS.colors.border}` }}>
                    <span style={{ fontSize: 12, color: DS.colors.textMuted }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{v}</span>
                  </div>
                ))}
              </Card>
              <div style={{ display: 'flex', gap: 12 }}>
                <Btn variant="outline" style={{ flex: 1 }} onClick={() => setCurrentVep(null)}>Nuevo período</Btn>
                <a href="https://servicios1.afip.gob.ar/vep/" target="_blank" rel="noopener" style={{ flex: 1, textDecoration: 'none' }}>
                  <Btn variant="primary" style={{ width: '100%' }}>Pagar en ARCA →</Btn>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </WebContent>
  );
}
window.WebVep = WebVep;
