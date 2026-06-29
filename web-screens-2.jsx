
// MonoClaro Web — Screens part 2: Vencimientos, Topes, Recategorización, Contador, Perfil
// =======================================================================================

// ── VENCIMIENTOS ────────────────────────────────────────
function WebVencimientos({ navigate }) {
  const [mes, setMes] = React.useState(4);
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const data = {
    3: [
      { dia: 15, tipo: 'DDJJ Informativa', desc: 'Declaración de ingresos', monto: '—', estado: 'pagado' },
      { dia: 20, tipo: 'Monotributo', desc: 'Pago mensual — Abril 2026', monto: '$42.830', estado: 'pagado' },
    ],
    4: [
      { dia: 20, tipo: 'Monotributo', desc: 'Pago mensual — Mayo 2026', monto: '$42.830', estado: 'proximo' },
      { dia: 31, tipo: 'Recategorización', desc: 'Período enero–junio (opcional)', monto: '—', estado: 'futuro' },
    ],
    5: [
      { dia: 20, tipo: 'Monotributo', desc: 'Pago mensual — Junio 2026', monto: '$42.830', estado: 'futuro' },
      { dia: 30, tipo: 'Recategorización', desc: 'Semestral obligatoria', monto: '—', estado: 'futuro' },
    ],
  };
  const estados = {
    pagado:   { c: DS.colors.success, bg: DS.colors.successLight, label: 'Pagado' },
    pendiente:{ c: DS.colors.warning, bg: DS.colors.warningLight, label: 'Pendiente' },
    proximo:  { c: DS.colors.danger,  bg: DS.colors.dangerLight,  label: 'Vence pronto' },
    futuro:   { c: DS.colors.textMuted, bg: DS.colors.bg,         label: 'Programado' },
  };
  const items = data[mes] || [];

  return (
    <WebContent maxWidth={960}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatTile label="PAGADOS EN EL PERÍODO" value={items.filter(i => i.estado === 'pagado').length} sub="Al día con AFIP" icon="check" accent={DS.colors.success} />
        <StatTile label="PENDIENTES" value={items.filter(i => ['pendiente','proximo'].includes(i.estado)).length} sub="Requieren acción" icon="clock" accent={DS.colors.warning} />
        <StatTile label="PROGRAMADOS" value={items.filter(i => i.estado === 'futuro').length} sub="Próximos meses" icon="calendar" accent={DS.colors.primary} />
      </div>

      {/* Month selector */}
      <Card style={{ padding: '10px 12px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {meses.map((m, i) => (
            <div key={i} onClick={() => setMes(i)} style={{
              padding: '7px 14px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              background: mes === i ? DS.colors.primary : 'transparent',
              color: mes === i ? '#fff' : DS.colors.textMid,
            }}>{m}</div>
          ))}
        </div>
      </Card>

      <WebSection>{meses[mes]} 2026</WebSection>
      {items.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '34px', color: DS.colors.textMuted, fontSize: 13.5 }}>Sin vencimientos en este período</Card>
      )}
      {items.map((item, i) => {
        const s = estados[item.estado];
        return (
          <Card key={i} style={{ marginBottom: 10, padding: '15px 18px' }}>
            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 9, background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: DS.colors.text, lineHeight: 1 }}>{item.dia}</div>
                <div style={{ fontSize: 9, color: DS.colors.textMuted, fontWeight: 600, marginTop: 2 }}>{meses[mes].toUpperCase()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: DS.colors.text }}>{item.tipo}</div>
                <div style={{ fontSize: 12.5, color: DS.colors.textMuted, marginTop: 2 }}>{item.desc}</div>
              </div>
              {item.monto !== '—' && <div style={{ fontSize: 15, fontWeight: 700, color: DS.colors.text }}>{item.monto}</div>}
              <Badge color={s.bg} textColor={s.c} style={{ minWidth: 90, justifyContent: 'center' }}>{s.label}</Badge>
              {item.estado === 'proximo' && (
                <Btn variant="primary" style={{ padding: '8px 15px', fontSize: 13 }} onClick={() => navigate('vep')}>Generar VEP</Btn>
              )}
            </div>
          </Card>
        );
      })}

      <Card style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', borderLeft: `3px solid ${DS.colors.primary}` }}>
        <Icon name="bell" size={18} color={DS.colors.primary} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: DS.colors.text }}>Recordatorios activos</div>
          <div style={{ fontSize: 12.5, color: DS.colors.textMuted, marginTop: 1 }}>Recibís un aviso por email 5 días antes de cada vencimiento.</div>
        </div>
      </Card>
    </WebContent>
  );
}
window.WebVencimientos = WebVencimientos;

// ── TOPES ───────────────────────────────────────────────
function WebTopes({ navigate, categoria, invoices }) {
  const TOPES_CAT = { A: 2109906, B: 3150950, C: 4201265, D: 5251580, E: 6302896, F: 7878620, G: 9454344 };
  const facturado = (invoices || []).reduce((sum, f) => sum + f.monto, 0);
  const tope = TOPES_CAT[categoria] || 5251580;
  const categorias = [
    { cat: 'A', tope: 2109906 }, { cat: 'B', tope: 3150950 }, { cat: 'C', tope: 4201265 },
    { cat: 'D', tope: 5251580 }, { cat: 'E', tope: 6302896 }, { cat: 'F', tope: 7878620 }, { cat: 'G', tope: 9454344 },
  ];
  const pct = Math.round((facturado / tope) * 100);
  const proyeccion = facturado + (facturado / 9) * 3;
  const riesgo = proyeccion > tope;

  return (
    <WebContent maxWidth={1000}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          {/* Main */}
          <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: DS.colors.primary, padding: '24px 26px' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4 }}>FACTURADO EN EL AÑO FISCAL</div>
              <div style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginTop: 5, letterSpacing: -0.6 }}>${facturado.toLocaleString('es-AR')}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>de ${tope.toLocaleString('es-AR')} · tope Categoría {categoria}</div>
              <ProgressBar value={facturado} max={tope} color="rgba(255,255,255,0.9)" bg="rgba(255,255,255,0.18)" height={9} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{pct}% utilizado</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Disponible ${((tope - facturado) / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </Card>

          {/* Category table */}
          <WebSection>Escala de categorías 2026</WebSection>
          <Card style={{ padding: '6px 16px' }}>
            {categorias.map((c, i, arr) => {
              const isCurrent = c.cat === categoria;
              const isPassed = facturado > c.tope;
              return (
                <div key={c.cat} style={{
                  display: 'flex', alignItems: 'center', gap: 13, padding: '11px 4px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                    background: isCurrent ? DS.colors.primary : DS.colors.bg,
                    border: `1px solid ${isCurrent ? DS.colors.primary : DS.colors.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: isCurrent ? '#fff' : DS.colors.textMid,
                  }}>{c.cat}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13.5, fontWeight: isCurrent ? 600 : 500, color: DS.colors.text }}>Hasta ${c.tope.toLocaleString('es-AR')}</span>
                    <span style={{ fontSize: 12, color: DS.colors.textMuted }}> · anual</span>
                  </div>
                  {isCurrent && <Badge color={DS.colors.primary} textColor="#fff">Tu categoría</Badge>}
                  {isPassed && !isCurrent && <span style={{ fontSize: 11.5, color: DS.colors.textMuted }}>Superado</span>}
                </div>
              );
            })}
          </Card>
        </div>

        {/* Right: projection */}
        <div>
          <WebSection>Proyección anual</WebSection>
          <Card style={{ marginBottom: 16, borderLeft: `3px solid ${riesgo ? DS.colors.danger : DS.colors.success}` }}>
            <div style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 14 }}>
              <Icon name={riesgo ? 'alert' : 'shield'} size={20} color={riesgo ? DS.colors.danger : DS.colors.success} />
              <div style={{ fontSize: 14.5, fontWeight: 700, color: DS.colors.text }}>
                {riesgo ? 'Riesgo de superar el tope' : 'Dentro del tope'}
              </div>
            </div>
            <div style={{ fontSize: 13, color: DS.colors.textMid, lineHeight: 1.55, marginBottom: 14 }}>
              Al ritmo actual, proyectás <strong>${(proyeccion / 1000000).toFixed(2)}M</strong> al cierre del año fiscal.
              {riesgo ? ' Esto supera el tope de tu categoría — conviene recategorizarte.' : ' Estás dentro de los límites.'}
            </div>
            <div style={{ background: DS.colors.bg, borderRadius: 8, padding: '12px 14px', border: `1px solid ${DS.colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: DS.colors.textMuted }}>Proyección</span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>${(proyeccion / 1000000).toFixed(2)}M</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: DS.colors.textMuted }}>Tope Cat. {categoria}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>${(tope / 1000000).toFixed(2)}M</span>
              </div>
            </div>
          </Card>
          {riesgo && (
            <Btn variant="primary" style={{ width: '100%', marginBottom: 10 }} onClick={() => navigate('recategorizacion')}>Revisar recategorización</Btn>
          )}
          <Btn variant="outline" style={{ width: '100%' }} onClick={() => navigate('derivar')}>Consultar a mi contador</Btn>
        </div>
      </div>
    </WebContent>
  );
}
window.WebTopes = WebTopes;

// ── RECATEGORIZACIÓN ────────────────────────────────────
function WebRecategorizacion({ navigate, categoria, onCategoriaChange, invoices }) {
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const run = () => { setLoading(true); setTimeout(() => { setLoading(false); setStep(1); }, 1600); };

  const TOPES_CAT = { A: 2109906, B: 3150950, C: 4201265, D: 5251580, E: 6302896, F: 7878620, G: 9454344 };
  const facturado = (invoices || []).reduce((sum, f) => sum + f.monto, 0);
  const proyeccionAnual = facturado * 2;
  const catActualTope = TOPES_CAT[categoria] || 5251580;
  const catSugeridaKey = Object.keys(TOPES_CAT).find(k => TOPES_CAT[k] > proyeccionAnual) || 'G';
  const catSugerida = catSugeridaKey === categoria ? categoria : catSugeridaKey;

  const params = [
    { label: 'Facturación semestral', valor: `$${facturado.toLocaleString('es-AR')}`, ok: facturado <= catActualTope / 2 },
    { label: 'Proyección anual', valor: `$${proyeccionAnual.toLocaleString('es-AR')}`, ok: proyeccionAnual <= catActualTope },
    { label: 'Energía eléctrica consumida', valor: '1.200 kWh/año', ok: true },
    { label: 'Superficie afectada', valor: '0 m²', ok: true },
    { label: 'Personal en relación de dependencia', valor: '0', ok: true },
  ];

  if (step === 2) return (
    <WebContent maxWidth={620}>
      <Card style={{ textAlign: 'center', padding: '44px 36px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 99, background: DS.colors.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Icon name="check" size={32} color={DS.colors.success} strokeWidth={2.2} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: DS.colors.text, marginBottom: 8 }}>Recategorización iniciada</div>
        <div style={{ fontSize: 13.5, color: DS.colors.textMid, lineHeight: 1.6, marginBottom: 22 }}>
          Tu solicitud de cambio a <strong>Categoría {catSugerida}</strong> fue registrada en AFIP. El nuevo importe rige desde el 1/07/2026.
        </div>
        <div style={{ background: DS.colors.bg, borderRadius: 10, padding: '16px 20px', marginBottom: 24, border: `1px solid ${DS.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: DS.colors.textMuted }}>Nueva cuota mensual</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: DS.colors.text }}>$52.340</span>
        </div>
        <Btn variant="primary" style={{ width: '100%' }} onClick={() => navigate('dashboard')}>Volver al resumen</Btn>
      </Card>
    </WebContent>
  );

  return (
    <WebContent maxWidth={760}>
      {step === 0 && (
        <>
          <Card style={{ marginBottom: 20, borderLeft: `3px solid ${DS.colors.warning}`, display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <Icon name="calendar" size={20} color={DS.colors.warning} style={{ marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: DS.colors.text }}>Recategorización semestral · enero–junio 2026</div>
              <div style={{ fontSize: 12.5, color: DS.colors.textMid, marginTop: 3, lineHeight: 1.5 }}>El plazo vence el 30 de junio. El sistema analiza tu facturación y parámetros para sugerir la categoría correcta.</div>
            </div>
          </Card>

          <WebSection>Parámetros que verifica el sistema</WebSection>
          <Card style={{ marginBottom: 22, padding: '6px 18px' }}>
            {['Facturación acumulada del semestre', 'Energía eléctrica consumida', 'Superficie del local afectada', 'Personal en relación de dependencia', 'Precio unitario máximo de venta'].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none' }}>
                <Icon name="check" size={15} color={DS.colors.success} strokeWidth={2} />
                <span style={{ fontSize: 13.5, color: DS.colors.textMid }}>{item}</span>
              </div>
            ))}
          </Card>
          <Btn variant="primary" style={{ width: 240 }} disabled={loading} onClick={run}>{loading ? 'Analizando datos…' : 'Verificar categoría'}</Btn>
          {loading && <div style={{ marginTop: 14, color: DS.colors.textMuted, fontSize: 13 }}>Consultando datos de AFIP…</div>}
        </>
      )}

      {step === 1 && (
        <>
          <Card style={{ marginBottom: 20, borderLeft: `3px solid ${DS.colors.warning}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
              <Icon name="refresh" size={22} color={catSugerida !== categoria ? DS.colors.warning : DS.colors.success} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: DS.colors.text }}>
                  {catSugerida !== categoria ? 'Se recomienda recategorizar' : 'Categoría correcta'}
                </div>
                <div style={{ fontSize: 12.5, color: DS.colors.textMuted }}>
                  {catSugerida !== categoria
                    ? `Tu proyección anual supera el tope de Categoría ${categoria}`
                    : `Tu facturación está dentro de los límites de Categoría ${categoria}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ flex: 1, textAlign: 'center', background: DS.colors.bg, borderRadius: 9, padding: '14px 8px', border: `1px solid ${DS.colors.border}` }}>
                <div style={{ fontSize: 11.5, color: DS.colors.textMuted, fontWeight: 600 }}>ACTUAL</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: DS.colors.textMid, marginTop: 2 }}>Cat. {categoria}</div>
                <div style={{ fontSize: 11.5, color: DS.colors.textMuted, marginTop: 2 }}>$42.830/mes</div>
              </div>
              <Icon name="arrowRight" size={22} color={DS.colors.textMuted} />
              <div style={{ flex: 1, textAlign: 'center', background: DS.colors.primary, borderRadius: 9, padding: '14px 8px' }}>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>SUGERIDA</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 2 }}>Cat. {catSugerida}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>$52.340/mes</div>
              </div>
            </div>
          </Card>

          <WebSection>Análisis de parámetros</WebSection>
          <Card style={{ marginBottom: 22, padding: '6px 18px' }}>
            {params.map((p, i, arr) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none' }}>
                <span style={{ fontSize: 13.5, color: DS.colors.textMid }}>{p.label}</span>
                <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{p.valor}</span>
                  <Icon name={p.ok ? 'check' : 'alert'} size={15} color={p.ok ? DS.colors.success : DS.colors.warning} strokeWidth={2} />
                </div>
              </div>
            ))}
          </Card>

          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="outline" style={{ flex: 1 }} onClick={() => navigate('derivar')}>Consultar contador</Btn>
            <Btn variant="primary" style={{ flex: 1 }} onClick={() => { if (onCategoriaChange && catSugerida !== categoria) onCategoriaChange(catSugerida); setStep(2); }}>
              Recategorizarme a Cat. {catSugerida}
            </Btn>
          </div>
        </>
      )}
    </WebContent>
  );
}
window.WebRecategorizacion = WebRecategorizacion;

// ── MI CONTADOR ─────────────────────────────────────────
function WebDerivar({ navigate, estudio }) {
  const [selected, setSelected] = React.useState(null);
  const [sent, setSent] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const motivos = [
    { id: 'recateg', icon: 'refresh', label: 'Recategorización', desc: 'Ayuda para cambiar de categoría' },
    { id: 'exceder', icon: 'alert', label: 'Riesgo de superar topes', desc: 'Estoy cerca del límite anual' },
    { id: 'baja', icon: 'fileText', label: 'Baja del monotributo', desc: 'Quiero gestionar la baja del régimen' },
    { id: 'exclusion', icon: 'shield', label: 'Notificación de AFIP', desc: 'Recibí una intimación o exclusión' },
    { id: 'otro', icon: 'send', label: 'Otra consulta', desc: 'Tengo una consulta general' },
  ];

  if (sent) return (
    <WebContent maxWidth={620}>
      <Card style={{ textAlign: 'center', padding: '40px 36px' }}>
        <div style={{ width: 60, height: 60, borderRadius: 99, background: DS.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Icon name="check" size={30} color={DS.colors.primary} strokeWidth={2.2} />
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: DS.colors.text, marginBottom: 8 }}>Consulta enviada</div>
        <div style={{ fontSize: 13.5, color: DS.colors.textMid, lineHeight: 1.6, marginBottom: 22 }}>
          Tu contador asignado responderá en las próximas <strong>2 a 4 horas hábiles</strong>.
        </div>
        <div style={{ background: DS.colors.bg, borderRadius: 10, padding: '16px 18px', textAlign: 'left', border: `1px solid ${DS.colors.border}`, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 22 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: DS.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="user" size={20} color={DS.colors.primary} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: DS.colors.text }}>Cra. Andrea Morales</div>
            <div style={{ fontSize: 12.5, color: DS.colors.textMuted }}>{estudio || 'Estudio Contable'} · Contadora Pública</div>
          </div>
        </div>
        <Btn variant="primary" style={{ width: '100%' }} onClick={() => navigate('dashboard')}>Volver al resumen</Btn>
      </Card>
    </WebContent>
  );

  return (
    <WebContent maxWidth={900}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          <Card style={{ marginBottom: 18, borderLeft: `3px solid ${DS.colors.primary}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon name="briefcase" size={19} color={DS.colors.primary} style={{ marginTop: 1 }} />
            <div style={{ fontSize: 13, color: DS.colors.textMid, lineHeight: 1.55 }}>
              Las consultas son respondidas por el equipo de contadores del estudio. Respuesta garantizada en menos de 4 horas hábiles.
            </div>
          </Card>

          <WebSection>¿Sobre qué necesitás ayuda?</WebSection>
          {motivos.map(m => (
            <div key={m.id} onClick={() => setSelected(m.id)} style={{
              display: 'flex', gap: 13, alignItems: 'center', padding: '14px 16px', marginBottom: 8, borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${selected === m.id ? DS.colors.primary : DS.colors.border}`,
              background: selected === m.id ? DS.colors.primaryLight : DS.colors.card,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: DS.colors.bg, border: `1px solid ${DS.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={m.icon} size={18} color={selected === m.id ? DS.colors.primary : DS.colors.textMid} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: DS.colors.text }}>{m.label}</div>
                <div style={{ fontSize: 12.5, color: DS.colors.textMuted, marginTop: 1 }}>{m.desc}</div>
              </div>
              {selected === m.id && <Icon name="check" size={18} color={DS.colors.primary} strokeWidth={2.2} />}
            </div>
          ))}

          {selected && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: DS.colors.textMid, marginBottom: 6 }}>Mensaje adicional (opcional)</div>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Describí brevemente tu situación…" rows={3}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 9, border: `1.5px solid ${DS.colors.border}`, fontSize: 13, fontFamily: DS.font, color: DS.colors.text, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
              <Btn variant="primary" style={{ width: '100%', marginTop: 12 }} onClick={() => setSent(true)}>Enviar consulta</Btn>
            </div>
          )}
        </div>

        {/* Contador card */}
        <div>
          <WebSection>Tu contador asignado</WebSection>
          <Card>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 14, borderBottom: `1px solid ${DS.colors.border}`, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: DS.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="user" size={24} color={DS.colors.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: DS.colors.text }}>Cra. Andrea Morales</div>
                <div style={{ fontSize: 12.5, color: DS.colors.textMuted }}>Contadora Pública · Mat. 12345</div>
              </div>
            </div>
            {[['Estudio', estudio || 'Estudio Contable'], ['Horario', 'Lun a Vie · 9 a 18 hs'], ['Tiempo de respuesta', '< 4 horas hábiles']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: 12.5, color: DS.colors.textMuted }}>{k}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: DS.colors.text }}>{v}</span>
              </div>
            ))}
            <Btn variant="outline" style={{ width: '100%', marginTop: 12 }} onClick={() => {}}><Icon name="phone" size={15} color={DS.colors.primary} /> Llamar al estudio</Btn>
          </Card>
        </div>
      </div>
    </WebContent>
  );
}
window.WebDerivar = WebDerivar;

// ── PERFIL ──────────────────────────────────────────────
function WebPerfil({ navigate, userName, categoria, estudio }) {
  const [notif, setNotif] = React.useState(true);
  const [bio, setBio] = React.useState(false);
  const [email, setEmail] = React.useState(true);

  const Toggle = ({ val, set }) => (
    <div onClick={() => set(!val)} style={{
      width: 40, height: 23, borderRadius: 99, flexShrink: 0,
      background: val ? DS.colors.primary : DS.colors.border, position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
    }}>
      <div style={{ position: 'absolute', top: 3, left: val ? 20 : 3, width: 17, height: 17, borderRadius: 99, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  );

  return (
    <WebContent maxWidth={900}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          {/* Identity */}
          <Card style={{ marginBottom: 20, display: 'flex', gap: 15, alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: DS.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
              {userName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: DS.colors.text }}>{userName}</div>
              <div style={{ fontSize: 13, color: DS.colors.textMuted }}>maria.garcia@email.com</div>
              <Badge style={{ marginTop: 6 }} color={DS.colors.primaryLight} textColor={DS.colors.primary}>Categoría {categoria} · Activa</Badge>
            </div>
          </Card>

          <WebSection>Datos fiscales</WebSection>
          <Card>
            {[['CUIT', '27-34567890-1'], ['Inicio de actividad', '15/03/2019'], ['Actividad', 'Servicios profesionales'], ['Domicilio fiscal', 'Av. Corrientes 1234, CABA'], ['Obra social', 'OSDE — Plan 210']].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none' }}>
                <span style={{ fontSize: 13, color: DS.colors.textMuted }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: DS.colors.text }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <WebSection>Estudio contable</WebSection>
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${DS.colors.border}`, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 9, background: DS.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="building" size={21} color={DS.colors.primary} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: DS.colors.text }}>{estudio || 'Estudio Contable'}</div>
                <div style={{ fontSize: 12.5, color: DS.colors.textMuted }}>Contadora: Cra. Andrea Morales</div>
              </div>
            </div>
            <Btn variant="secondary" style={{ width: '100%' }} onClick={() => navigate('derivar')}>Enviar consulta</Btn>
          </Card>

          <WebSection>Preferencias</WebSection>
          <Card>
            {[
              { label: 'Notificaciones por email', sub: 'Avisos de vencimientos y topes', val: email, set: setEmail },
              { label: 'Notificaciones push', sub: 'Alertas en el navegador', val: notif, set: setNotif },
              { label: 'Acceso con biometría', sub: 'Huella o Face ID', val: bio, set: setBio },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${DS.colors.border}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DS.colors.text }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: DS.colors.textMuted }}>{item.sub}</div>
                </div>
                <Toggle val={item.val} set={item.set} />
              </div>
            ))}
          </Card>

          <Btn variant="outline" style={{ width: '100%', marginTop: 20, color: DS.colors.danger, borderColor: DS.colors.border }} onClick={() => {}}>
            <Icon name="logout" size={16} color={DS.colors.danger} /> Cerrar sesión
          </Btn>
        </div>
      </div>
    </WebContent>
  );
}
window.WebPerfil = WebPerfil;
