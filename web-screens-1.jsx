
// MonoClaro Web — Screens part 1: Dashboard, Facturación, VEP
// ===================================================================

// ── DASHBOARD ───────────────────────────────────────────
function WebDashboard({ navigate, userName, categoria, invoices }) {
  const TOPES_CAT = { A: 2109906, B: 3150950, C: 4201265, D: 5251580, E: 6302896, F: 7878620, G: 9454344 };
  const tope = TOPES_CAT[categoria] || 5251580;
  const facturado = invoices.reduce((sum, f) => sum + f.monto, 0);
  const pct = Math.min(100, Math.round((facturado / tope) * 100));

  const now = new Date();
  const facturasMes = invoices.filter(f => {
    const [, m, y] = f.fecha.split('/');
    return parseInt(m) === now.getMonth() + 1 && parseInt(y) === now.getFullYear();
  });
  const totalMes = facturasMes.reduce((s, f) => s + f.monto, 0);

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
      <div style={{
        background: DS.colors.card, borderRadius: DS.radius.lg,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 13,
        marginBottom: 22, border: `1px solid ${DS.colors.border}`,
        borderLeft: `3px solid ${DS.colors.warning}`,
      }}>
        <Icon name="alert" size={19} color={DS.colors.warning} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: DS.colors.text }}>Vencimiento próximo · </span>
          <span style={{ fontSize: 13.5, color: DS.colors.textMid }}>Pago del monotributo de Mayo 2026 ($42.830) vence en 5 días</span>
        </div>
        <Btn variant="primary" style={{ padding: '8px 15px', fontSize: 13 }} onClick={() => navigate('vep')}>Generar VEP</Btn>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 26 }}>
        <StatTile label="FACTURADO 2026" value={fmt(facturado)} sub={`${pct}% del tope anual`} icon="dollar" accent={DS.colors.primary} trend={{ up: true, value: '12%' }} />
        <StatTile label="CATEGORÍA ACTUAL" value={`Cat. ${categoria}`} sub="Cuota $42.830 / mes" icon="fileText" accent={DS.colors.accent} />
        <StatTile label="FACTURAS DEL MES" value={facturasMes.length} sub={`${fmt(totalMes)} emitido`} icon="invoice" accent={DS.colors.success} />
        <StatTile label="PRÓXIMO PAGO" value="20 May" sub="Quedan 5 días" icon="clock" accent={DS.colors.warning} />
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
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
            {[
              { dia: '20', mes: 'MAY', tipo: 'Monotributo', desc: 'Pago mensual', proximo: true },
              { dia: '30', mes: 'JUN', tipo: 'Recategorización', desc: 'Semestral obligatoria', proximo: false },
              { dia: '20', mes: 'JUL', tipo: 'Monotributo', desc: 'Pago mensual', proximo: false },
            ].map((v, i, arr) => (
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
function WebFactura({ navigate, cuit: cuitEmisor, invoices, addInvoice }) {
  const [showModal, setShowModal] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [form, setForm] = React.useState({ tipo: 'C', cuit: '', razon: '', concepto: '', monto: '', condicion: 'Consumidor Final' });
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
    setShowModal(false); setStep(1); setConfirmError(null); setCaeResult(null);
    setForm({ tipo: 'C', cuit: '', razon: '', concepto: '', monto: '', condicion: 'Consumidor Final' });
  };

  // Lookup de CUIT en el padrón ARCA
  const lookupCuit = async () => {
    const cuitLimpio = form.cuit.replace(/\D/g, '');
    if (cuitLimpio.length !== 11) return;
    setCuitLoading(true);
    try {
      const res = await fetch(`${API_BASE}/padron/${cuitLimpio}?cuitEmisor=${(cuitEmisor||'').replace(/\D/g,'')}`);
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cuit: emisorCuit,
            ptoVta: 1,
            tipo: form.tipo,
            concepto: 2, // Servicios
            docTipo,
            docNro,
            importeTotal: Number(form.monto),
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatTile label="EMITIDO ESTE MES" value={totalMes >= 1000000 ? `$${(totalMes/1000000).toFixed(2)}M` : `$${(totalMes/1000).toFixed(0)}K`} sub={`${facturasMes.length} comprobantes`} icon="trending" accent={DS.colors.success} />
        <StatTile label="PROMEDIO POR FACTURA" value={`$${(promedio/1000).toFixed(1)}K`} sub="Promedio histórico" icon="chart" accent={DS.colors.primary} />
        <StatTile label="ÚLTIMO COMPROBANTE" value={`Nº ${nextNumInt - 1}`} sub={invoices[0] ? `Emitido el ${invoices[0].fecha}` : '—'} icon="invoice" accent={DS.colors.accent} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
        <WebSection style={{ margin: 0 }}>Historial de facturas</WebSection>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={15} color={DS.colors.textMuted} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente, N° o concepto…"
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                borderRadius: 8, border: `1.5px solid ${DS.colors.border}`, fontSize: 13,
                fontFamily: DS.font, color: DS.colors.text, outline: 'none', width: 240,
                background: DS.colors.card,
              }}
            />
          </div>
          <Btn variant="primary" onClick={() => setShowModal(true)}><Icon name="plus" size={16} color="#fff" /> Nueva factura</Btn>
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
                <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                  {[['C', 'Consumidor Final'], ['E', 'Exportación']].map(([t, d]) => (
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
                <Field label="Concepto" value={form.concepto} onChange={v => set('concepto', v)} placeholder="Servicios profesionales — Abril 2026" />
                <Field label="Monto total" value={form.monto} onChange={v => set('monto', v.replace(/\D/g, ''))} placeholder="0" prefix="$" type="tel" />
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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
                  {[['Comprobante', `FC ${form.tipo} ${nextNumFormatted}`], ['Tipo', `Factura ${form.tipo}`], ['Receptor', form.razon || 'Consumidor Final'], ['CUIT', form.cuit || '—'], ['Concepto', form.concepto], ['Condición IVA', form.condicion]].map(([k, v]) => (
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

// ── GENERAR VEP ─────────────────────────────────────────
function WebVep({ navigate }) {
  const [generated, setGenerated] = React.useState(false);
  const [periodo, setPeriodo] = React.useState('05/2026');
  const [copied, setCopied] = React.useState(false);
  const vepCode = '0110250427000000000012893745000000004283000';
  const vepNum = '72.845.293';

  const copyCode = () => {
    navigator.clipboard.writeText(vepCode).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = vepCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadVep = () => {
    const content = [
      `VEP Nº ${vepNum}`,
      '='.repeat(50),
      `Período: ${periodo}`,
      `Impuesto integrado: $18.430`,
      `Obra social: $15.800`,
      `Aporte jubilatorio: $8.600`,
      '='.repeat(50),
      `TOTAL: $42.830`,
      '',
      `Código de pago electrónico:`,
      vepCode,
      '',
      `Válido hasta: 20/05/2026 23:59 hs`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vep-${periodo.replace('/', '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <WebContent maxWidth={880}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <WebSection>Período a pagar</WebSection>
          <Card style={{ marginBottom: 20, padding: '10px 16px' }}>
            {[['04/2026', 'Pagado', 'pagado'], ['05/2026', 'Pendiente', 'pendiente'], ['06/2026', 'No vencido', 'futuro']].map(([p, label, est], i, arr) => (
              <div key={p} onClick={() => { if (est !== 'pagado') { setPeriodo(p); setGenerated(false); } }} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '13px 6px', cursor: est === 'pagado' ? 'default' : 'pointer',
                borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                    border: `1.5px solid ${periodo === p ? DS.colors.primary : DS.colors.border}`,
                    background: periodo === p ? DS.colors.primary : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{periodo === p && <div style={{ width: 7, height: 7, borderRadius: 99, background: '#fff' }} />}</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: est === 'pagado' ? DS.colors.textMuted : DS.colors.text }}>{p}</span>
                </div>
                <Badge color={est === 'pagado' ? DS.colors.successLight : est === 'pendiente' ? DS.colors.warningLight : DS.colors.bg}
                  textColor={est === 'pagado' ? DS.colors.success : est === 'pendiente' ? DS.colors.warning : DS.colors.textMuted}>{label}</Badge>
              </div>
            ))}
          </Card>

          <WebSection>Detalle de la cuota</WebSection>
          <Card>
            {[['Impuesto integrado', '$18.430'], ['Obra social', '$15.800'], ['Aporte jubilatorio', '$8.600']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${DS.colors.border}` }}>
                <span style={{ fontSize: 13, color: DS.colors.textMuted }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>Total a pagar</span>
              <span style={{ fontSize: 19, fontWeight: 700, color: DS.colors.text }}>$42.830</span>
            </div>
          </Card>
        </div>

        <div>
          {!generated ? (
            <>
              <WebSection>Generar volante</WebSection>
              <Card style={{ textAlign: 'center', padding: '30px 24px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: DS.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon name="card" size={26} color={DS.colors.primary} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: DS.colors.text }}>VEP para período {periodo}</div>
                <div style={{ fontSize: 12.5, color: DS.colors.textMuted, margin: '5px 0' }}>Volante Electrónico de Pago</div>
                <div style={{ fontSize: 27, fontWeight: 700, color: DS.colors.text, margin: '10px 0 16px' }}>$42.830</div>
                <div style={{ background: DS.colors.bg, borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: DS.colors.textMid, border: `1px solid ${DS.colors.border}` }}>
                  Vence el <strong>20/05/2026</strong> · quedan 23 días
                </div>
                <Btn variant="primary" style={{ width: '100%' }} onClick={() => setGenerated(true)}>Generar VEP</Btn>
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
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: DS.colors.textMuted, letterSpacing: 0.4 }}>NÚMERO DE VEP</div>
                  <div style={{ fontSize: 23, fontWeight: 700, color: DS.colors.text, letterSpacing: 1 }}>{vepNum}</div>
                  <div style={{ fontSize: 12, color: DS.colors.textMuted, marginTop: 2 }}>Válido hasta 20/05/2026 23:59 hs</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: DS.colors.textMuted, letterSpacing: 0.4, marginBottom: 6 }}>CÓDIGO DE PAGO ELECTRÓNICO</div>
                <div style={{ background: DS.colors.bg, borderRadius: 7, padding: '10px 12px', fontFamily: 'ui-monospace, monospace', fontSize: 11, color: DS.colors.text, wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 12, border: `1px solid ${DS.colors.border}` }}>{vepCode}</div>
                <Btn variant="secondary" style={{ width: '100%' }} onClick={copyCode}>
                  {copied ? <><Icon name="check" size={15} color={DS.colors.success} /> Copiado</> : <><Icon name="copy" size={15} color={DS.colors.primary} /> Copiar código</>}
                </Btn>
              </Card>
              <div style={{ display: 'flex', gap: 12 }}>
                <Btn variant="outline" style={{ flex: 1 }} onClick={downloadVep}><Icon name="download" size={15} color={DS.colors.primary} /> Descargar</Btn>
                <Btn variant="primary" style={{ flex: 1 }} onClick={() => setGenerated(false)}>Nuevo VEP</Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </WebContent>
  );
}
window.WebVep = WebVep;
