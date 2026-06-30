
// AreaGo Web — Desktop Layout Components
// =======================================
// Reuses window.DS, Badge, ProgressBar, Field, Btn, Icon

// ── Sidebar ─────────────────────────────────────────────
const WEB_NAV = [
  { id: 'dashboard',        icon: 'dashboard', label: 'Resumen' },
  { id: 'factura',          icon: 'invoice',   label: 'Facturación' },
  { id: 'vep',              icon: 'card',      label: 'Generar VEP' },
  { id: 'vencimientos',     icon: 'calendar',  label: 'Vencimientos' },
  { id: 'topes',            icon: 'chart',     label: 'Topes' },
  { id: 'recategorizacion', icon: 'refresh',   label: 'Recategorización' },
  { id: 'derivar',          icon: 'briefcase', label: 'Mi contador' },
];
window.WEB_NAV = WEB_NAV;

// Logotipo AreaGo: corchetes angulares (representan el "área acotada") + wordmark en Sora
function AreaGoLogo({ size = 30 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      {/* Isotipo: cuatro corchetes + flecha verde (simplificado en SVG inline) */}
      <div style={{
        width: size, height: size, borderRadius: 7,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 20 20" fill="none">
          {/* Corchetes */}
          <path d="M5 2H2v5" stroke={DS.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 13v5h3" stroke={DS.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 2h3v5" stroke={DS.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 13v5h-3" stroke={DS.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Flecha verde "Go" */}
          <path d="M7 10h7M11 7l3 3-3 3" stroke={DS.colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Wordmark */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: DS.fontDisplay, letterSpacing: -0.4, lineHeight: 1 }}>
          Area<span style={{ color: DS.colors.accent }}>Go</span>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active, onNavigate, userName, categoria, estudio }) {
  return (
    <div style={{
      width: 244, flexShrink: 0, height: '100%',
      background: DS.colors.primaryDeep,  // #1E2636 — navy profundo según manual
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <AreaGoLogo />
        <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 0.9, marginTop: 10 }}>
          {(estudio || 'ESTUDIO CONTABLE').toUpperCase()}
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {WEB_NAV.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 11px', borderRadius: 8, marginBottom: 1,
              cursor: 'pointer', transition: 'background 0.1s',
              background: isActive ? 'rgba(255,255,255,0.09)' : 'transparent',
              // Indicador verde izquierdo en ítem activo (regla del verde: acción/avance)
              borderLeft: isActive ? `2px solid ${DS.colors.accent}` : '2px solid transparent',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Icon
                name={item.icon}
                size={17}
                color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'}
                strokeWidth={isActive ? 1.9 : 1.6}
              />
              <span style={{
                fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
              }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* User card */}
      <div onClick={() => onNavigate('perfil')} style={{
        margin: '0 10px 12px', padding: '10px 11px', borderRadius: 9,
        background: active === 'perfil' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid rgba(255,255,255,0.07)`,
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        transition: 'background 0.1s',
      }}>
        <div style={{
          width: 33, height: 33, borderRadius: 7,
          background: DS.colors.accent + '33',  // verde con 20% opacidad
          border: `1px solid ${DS.colors.accent}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12.5, color: DS.colors.accent, fontWeight: 700, flexShrink: 0,
          fontFamily: DS.fontDisplay,
        }}>{userName.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>Cat. {categoria} · Activa</div>
        </div>
        <Icon name="chevron" size={14} color="rgba(255,255,255,0.35)" />
      </div>
    </div>
  );
}
window.Sidebar = Sidebar;

// ── Topbar ──────────────────────────────────────────────
function Topbar({ title, subtitle, onNotif, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '15px 32px', borderBottom: `1px solid ${DS.colors.border}`,
      background: DS.colors.card, flexShrink: 0,
    }}>
      <div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: DS.colors.text, letterSpacing: -0.3,
          fontFamily: DS.fontDisplay,
        }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: DS.colors.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {actions}
        <div onClick={onNotif} style={{
          width: 36, height: 36, borderRadius: DS.radius.md, position: 'relative',
          background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="bell" size={16} color={DS.colors.textMid} />
          <span style={{
            position: 'absolute', top: 8, right: 9, width: 6, height: 6,
            borderRadius: 99, background: DS.colors.danger, border: '1.5px solid #fff',
          }} />
        </div>
      </div>
    </div>
  );
}
window.Topbar = Topbar;

// ── Mobile Header ───────────────────────────────────────
function MobileHeader({ title, onMenu, onNotif }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', background: DS.colors.card,
      borderBottom: `1px solid ${DS.colors.border}`, flexShrink: 0,
    }}>
      <div onClick={onMenu} style={{
        width: 38, height: 38, borderRadius: DS.radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', background: DS.colors.bg, border: `1px solid ${DS.colors.border}`, flexShrink: 0,
      }}>
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <rect y="0" width="18" height="2" rx="1" fill={DS.colors.textMid}/>
          <rect y="6" width="18" height="2" rx="1" fill={DS.colors.textMid}/>
          <rect y="12" width="18" height="2" rx="1" fill={DS.colors.textMid}/>
        </svg>
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: DS.colors.text, fontFamily: DS.fontDisplay }}>{title}</span>
      <div onClick={onNotif} style={{
        width: 38, height: 38, borderRadius: DS.radius.md, position: 'relative',
        background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
      }}>
        <Icon name="bell" size={16} color={DS.colors.textMid} />
        <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: 99, background: DS.colors.danger, border: '1.5px solid #fff' }} />
      </div>
    </div>
  );
}
window.MobileHeader = MobileHeader;

// ── Web Content Wrapper ─────────────────────────────────
function WebContent({ children, maxWidth = 1120 }) {
  const bp = useBreakpoint();
  const pad = bp === 'sm' ? '16px 16px 90px' : bp === 'md' ? '20px 24px 90px' : '26px 32px 60px';
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: DS.colors.bg }}>
      <div style={{ maxWidth, margin: '0 auto', padding: pad }}>
        {children}
      </div>
    </div>
  );
}
window.WebContent = WebContent;

// ── Stat Tile ───────────────────────────────────────────
function StatTile({ label, value, sub, icon, accent = DS.colors.primary, trend }) {
  return (
    <Card style={{ padding: '17px 19px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: DS.radius.md,
          background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name={icon} size={16} color={accent} /></div>
        {trend && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 600, color: trend.up ? DS.colors.accent : DS.colors.danger }}>
            <Icon name="trending" size={12} color={trend.up ? DS.colors.accent : DS.colors.danger} /> {trend.value}
          </span>
        )}
      </div>
      {/* Eyebrow label — pequeño, uppercase, tracking amplio */}
      <div style={{ fontSize: 11, fontWeight: 700, color: DS.colors.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      {/* Valor — Sora para display numbers */}
      <div style={{ fontSize: 24, fontWeight: 700, color: DS.colors.text, letterSpacing: -0.5, fontFamily: DS.fontDisplay }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: DS.colors.textMuted, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}
window.StatTile = StatTile;

// ── Web Section Title ───────────────────────────────────
function WebSection({ children, action, onAction, style = {} }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, marginTop: 4, ...style }}>
      {/* Sora para section headings — jerarquía visual */}
      <span style={{ fontSize: 14, fontWeight: 700, color: DS.colors.text, letterSpacing: -0.2, fontFamily: DS.fontDisplay }}>{children}</span>
      {action && (
        <span onClick={onAction} style={{ fontSize: 12.5, color: DS.colors.accent, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {action}
        </span>
      )}
    </div>
  );
}
window.WebSection = WebSection;

// ── Modal ───────────────────────────────────────────────
function Modal({ children, onClose, width = 480 }) {
  const bp = useBreakpoint();
  const isMobile = bp === 'sm';
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(30,38,54,0.45)',
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      padding: isMobile ? 0 : 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: DS.colors.card,
        borderRadius: isMobile ? `${DS.radius.lg}px ${DS.radius.lg}px 0 0` : DS.radius.lg,
        width: '100%', maxWidth: isMobile ? '100%' : width,
        maxHeight: isMobile ? '92%' : '88%', overflowY: 'auto',
        boxShadow: '0 24px 60px rgba(30,38,54,0.3)',
      }}>
        {children}
      </div>
    </div>
  );
}
window.Modal = Modal;

// ── Modal Header ────────────────────────────────────────
function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '20px 24px 16px', borderBottom: `1px solid ${DS.colors.border}`,
    }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: DS.colors.text, fontFamily: DS.fontDisplay }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: DS.colors.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div onClick={onClose} style={{
        width: 30, height: 30, borderRadius: DS.radius.sm, background: DS.colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}><Icon name="x" size={14} color={DS.colors.textMid} /></div>
    </div>
  );
}
window.ModalHeader = ModalHeader;

// ── Data Table ──────────────────────────────────────────
function DataTable({ columns, rows, renderCell }) {
  const bp = useBreakpoint();
  const gridCols = columns.map(c => c.width || '1fr').join(' ');
  const minW = columns.length >= 5 ? 560 : 'auto';
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: minW }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '11px 20px', background: DS.colors.bg, borderBottom: `1px solid ${DS.colors.border}` }}>
            {columns.map(c => (
              <span key={c.key} style={{ fontSize: 10.5, fontWeight: 700, color: DS.colors.textMuted, letterSpacing: 0.5, textAlign: c.align || 'left', textTransform: 'uppercase' }}>{c.label}</span>
            ))}
          </div>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: gridCols,
              padding: '12px 20px', alignItems: 'center',
              borderBottom: i < rows.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = DS.colors.bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {columns.map(c => (
                <div key={c.key} style={{ textAlign: c.align || 'left' }}>{renderCell(row, c.key)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
window.DataTable = DataTable;
