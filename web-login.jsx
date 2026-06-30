// LoginScreen — pantalla de inicio de sesión AreaGo
// AdminPanel  — panel de gestión de clientes/usuarios para admin

// ─── LoginScreen ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Error al iniciar sesión'); return; }
      onLogin(data);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #D1D9E6', fontSize: 15, fontFamily: 'Inter, sans-serif',
    background: '#fff', outline: 'none', transition: 'border-color .15s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#1E2636',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: '#2A3548', borderRadius: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <span style={{ color: '#fff', fontSize: 26, fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>A</span>
          </div>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700, color: '#1E2636' }}>AreaGo</div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Gestión de Monotributo</div>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required style={inp}
              onFocus={e => e.target.style.borderColor = '#2B9C6E'}
              onBlur={e => e.target.style.borderColor = '#D1D9E6'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="••••••••" required style={inp}
              onFocus={e => e.target.style.borderColor = '#2B9C6E'}
              onBlur={e => e.target.style.borderColor = '#D1D9E6'}
            />
          </div>
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
            background: loading ? '#94A3B8' : '#2B9C6E', color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .15s',
          }}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94A3B8' }}>
          Solo usuarios autorizados. Para acceder contactá a tu estudio contable.
        </div>
      </div>
    </div>
  );
}

// ─── AdminPanel ──────────────────────────────────────────────────────────────

function AdminPanel({ token, adminUser, onLogout }) {
  const [tab, setTab] = React.useState('clientes'); // 'clientes' | 'crear'
  const [clientes, setClientes] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null); // cuit del cliente detalle

  // Crear usuario form
  const ACTIVIDADES = [
    'Servicios profesionales',
    'Desarrollo de software',
    'Consultoría y asesoramiento',
    'Diseño gráfico y multimedia',
    'Comunicación y marketing',
    'Contabilidad y auditoría',
    'Servicios jurídicos',
    'Arquitectura e ingeniería',
    'Salud y medicina',
    'Psicología y psicopedagogía',
    'Educación y capacitación',
    'Comercio minorista',
    'Comercio mayorista',
    'Servicios gastronómicos',
    'Transporte y logística',
    'Construcción y remodelación',
    'Servicios de limpieza',
    'Fotografía y video',
    'Música y artes escénicas',
    'Escritura y periodismo',
    'Traducción e interpretación',
    'Turismo y hotelería',
    'Actividad agropecuaria',
    'Otros servicios',
  ];

  const emptyForm = { email: '', password: '', cuit: '', nombre: '', categoria: 'C', estudio: '',
    calle: '', numero: '', piso: '', depto: '', localidad: '', provincia: 'Buenos Aires', cp: '', actividad: 'Servicios profesionales' };
  const [form, setForm] = React.useState(emptyForm);
  const [formError, setFormError] = React.useState('');
  const [formOk, setFormOk] = React.useState('');
  const [formLoading, setFormLoading] = React.useState(false);

  const authH = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadData = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/admin/clientes`, { headers: authH }).then(r => r.json()),
      fetch(`${API_BASE}/admin/stats`, { headers: authH }).then(r => r.json()),
    ]).then(([c, s]) => {
      setClientes(Array.isArray(c) ? c : []);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [token]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const createUser = async (e) => {
    e.preventDefault();
    setFormError(''); setFormOk(''); setFormLoading(true);
    // Armar domicilio completo desde los campos separados
    const partes = [form.calle, form.numero, form.piso && `Piso ${form.piso}`, form.depto && `Depto ${form.depto}`, form.localidad, form.provincia, form.cp].filter(Boolean);
    const domicilio = partes.join(', ');
    try {
      const r = await fetch(`${API_BASE}/admin/usuarios`, {
        method: 'POST', headers: authH,
        body: JSON.stringify({ ...form, domicilio }),
      });
      const data = await r.json();
      if (!r.ok) { setFormError(data.error || 'Error al crear usuario'); return; }
      setFormOk(`Usuario creado correctamente (CUIT ${data.cuit})`);
      setForm(emptyForm);
      loadData();
    } catch { setFormError('Error de conexión'); }
    finally { setFormLoading(false); }
  };

  const deleteUser = async (userId, nombre) => {
    if (!confirm(`¿Eliminar el acceso de ${nombre}? El cliente queda en el sistema.`)) return;
    await fetch(`${API_BASE}/admin/usuarios/${userId}`, { method: 'DELETE', headers: authH });
    loadData();
  };

  const filtered = clientes.filter(c =>
    !search || c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.cuit?.includes(search.replace(/\D/g, ''))
  );

  const inpStyle = {
    width: '100%', padding: '9px 13px', borderRadius: 9,
    border: '1.5px solid #D1D9E6', fontSize: 14, fontFamily: 'Inter, sans-serif',
    background: '#fff', outline: 'none',
  };

  const card = (content, style = {}) => (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', ...style }}>
      {content}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#1E2636', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
        <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>
          AreaGo <span style={{ color: '#2B9C6E' }}>Admin</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: '#94A3B8' }}>{adminUser?.email}</span>
        <button onClick={onLogout} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
          color: '#CBD5E1', padding: '6px 14px', cursor: 'pointer', fontSize: 13,
        }}>Salir</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px', width: '100%' }}>
        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Clientes', value: stats.totalClientes },
              { label: 'Facturas emitidas', value: stats.totalFacturas },
              { label: 'Total facturado', value: `$${Number(stats.totalFacturado).toLocaleString('es-AR')}` },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1E2636', fontFamily: 'Sora, sans-serif' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['clientes', 'Clientes'], ['crear', 'Crear usuario']].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: tab === t ? '#1E2636' : '#fff', color: tab === t ? '#fff' : '#64748B',
              boxShadow: tab === t ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
            }}>{l}</button>
          ))}
        </div>

        {/* Tab: clientes */}
        {tab === 'clientes' && (
          <div>
            {/* Search */}
            <div style={{ marginBottom: 14 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o CUIT..." style={{ ...inpStyle, maxWidth: 360 }} />
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Nombre', 'CUIT', 'Categoría', 'Estudio', 'Facturas', 'Usuario', 'Acciones'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748B', fontSize: 12, borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>Sin clientes</td></tr>
                    )}
                    {filtered.map(c => (
                      <tr key={c.cuit} style={{ borderBottom: '1px solid #F1F5F9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '11px 16px', fontWeight: 500, color: '#1E2636' }}>{c.nombre}</td>
                        <td style={{ padding: '11px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#475569' }}>{c.cuit}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                            Cat. {c.categoria}
                          </span>
                        </td>
                        <td style={{ padding: '11px 16px', color: '#64748B', fontSize: 13 }}>{c.estudio || '—'}</td>
                        <td style={{ padding: '11px 16px', color: '#64748B' }}>{c.totalFacturas}</td>
                        <td style={{ padding: '11px 16px' }}>
                          {c.tieneUsuario
                            ? <span style={{ color: '#2B9C6E', fontWeight: 600, fontSize: 13 }}>✓ Activo</span>
                            : <span style={{ color: '#94A3B8', fontSize: 13 }}>Sin acceso</span>}
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          {c.tieneUsuario && c.usuarioId && (
                            <button onClick={() => deleteUser(c.usuarioId, c.nombre)} style={{
                              background: '#FEF2F2', border: 'none', borderRadius: 6, color: '#DC2626',
                              padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                            }}>Revocar</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: crear usuario */}
        {tab === 'crear' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#1E2636', marginBottom: 20, fontFamily: 'Sora, sans-serif' }}>
                Nuevo cliente + usuario
              </div>
              <form onSubmit={createUser}>

                {/* Sección: Datos personales */}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10 }}>DATOS PERSONALES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  {[
                    { key: 'nombre', label: 'Nombre completo', span: 2, placeholder: 'María García', required: true },
                    { key: 'cuit', label: 'CUIT', placeholder: '27-34567890-1', required: true },
                    { key: 'categoria', label: 'Categoría', type: 'catSelect' },
                  ].map(({ key, label, span, placeholder, type, required }) => (
                    <div key={key} style={{ gridColumn: span === 2 ? '1 / -1' : undefined }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{label}</label>
                      {type === 'catSelect' ? (
                        <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inpStyle}>
                          {['A','B','C','D','E','F','G'].map(c => <option key={c} value={c}>Categoría {c}</option>)}
                        </select>
                      ) : (
                        <input type="text" value={form[key]} placeholder={placeholder} required={required}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inpStyle} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Sección: Actividad */}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10 }}>ACTIVIDAD ECONÓMICA</div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Actividad principal</label>
                  <select value={form.actividad} onChange={e => setForm(f => ({ ...f, actividad: e.target.value }))} style={inpStyle}>
                    {ACTIVIDADES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* Sección: Domicilio fiscal */}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10 }}>DOMICILIO FISCAL</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Calle</label>
                    <input type="text" value={form.calle} placeholder="Av. Corrientes" onChange={e => setForm(f => ({ ...f, calle: e.target.value }))} style={inpStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Número</label>
                    <input type="text" value={form.numero} placeholder="1234" onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} style={inpStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Piso</label>
                    <input type="text" value={form.piso} placeholder="3" onChange={e => setForm(f => ({ ...f, piso: e.target.value }))} style={inpStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Depto</label>
                    <input type="text" value={form.depto} placeholder="B" onChange={e => setForm(f => ({ ...f, depto: e.target.value }))} style={inpStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Localidad / Ciudad</label>
                    <input type="text" value={form.localidad} placeholder="Ciudad Autónoma de Buenos Aires" onChange={e => setForm(f => ({ ...f, localidad: e.target.value }))} style={inpStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Código postal</label>
                    <input type="text" value={form.cp} placeholder="1043" onChange={e => setForm(f => ({ ...f, cp: e.target.value }))} style={inpStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Provincia</label>
                  <select value={form.provincia} onChange={e => setForm(f => ({ ...f, provincia: e.target.value }))} style={inpStyle}>
                    {['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Sección: Estudio */}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10 }}>ESTUDIO CONTABLE</div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Nombre del estudio</label>
                  <input type="text" value={form.estudio} placeholder="Estudio Contable XYZ" onChange={e => setForm(f => ({ ...f, estudio: e.target.value }))} style={inpStyle} />
                </div>

                {/* Sección: Acceso */}
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10 }}>ACCESO AL SISTEMA</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email</label>
                    <input type="email" value={form.email} placeholder="maria@email.com" required onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inpStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Contraseña inicial</label>
                    <input type="password" value={form.password} placeholder="••••••••" required onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inpStyle} />
                  </div>
                </div>

                {formError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 14 }}>
                    {formError}
                  </div>
                )}
                {formOk && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', marginBottom: 14 }}>
                    {formOk}
                  </div>
                )}
                <button type="submit" disabled={formLoading} style={{
                  width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
                  background: formLoading ? '#94A3B8' : '#2B9C6E', color: '#fff',
                  fontSize: 15, fontWeight: 700, fontFamily: 'Sora, sans-serif', cursor: formLoading ? 'not-allowed' : 'pointer',
                }}>
                  {formLoading ? 'Creando...' : 'Crear cliente y usuario'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
