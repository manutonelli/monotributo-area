
// MonoClaro Web — Desktop Layout Components (sober)
// ==================================================
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

function Sidebar({ active, onNavigate, userName, categoria, estudio }) {
  return (
    <div style={{
      width: 244, flexShrink: 0, height: '100%',
      background: DS.colors.primary,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 22px 20px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 7,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: DS.colors.primary, letterSpacing: -0.5,
        }}>M</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>MonoClaro</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.8, marginTop: 1 }}>{(estudio || 'ESTUDIO CONTABLE').toUpperCase()}</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        {WEB_NAV.map(item => {
          const isActive = active === item.id;
          return (
            <div key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '9px 12px', borderRadius: 7, marginBottom: 2,
              cursor: 'pointer', transition: 'background 0.12s',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
              <Icon name={item.icon} size={18} color={isActive ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth={isActive ? 1.9 : 1.6} />
              <span style={{
                fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* User card */}
      <div onClick={() => onNavigate('perfil')} style={{
        margin: 12, padding: '11px 12px', borderRadius: 9,
        background: active === 'perfil' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 7,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: '#fff', fontWeight: 700, flexShrink: 0,
        }}>{userName.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Categoría {categoria}</div>
        </div>
        <Icon name="chevron" size={15} color="rgba(255,255,255,0.4)" />
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
      padding: '16px 32px', borderBottom: `1px solid ${DS.colors.border}`,
      background: DS.colors.card, flexShrink: 0,
    }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 700, color: DS.colors.text, letterSpacing: -0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: DS.colors.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {actions}
        <div onClick={onNotif} style={{
          width: 38, height: 38, borderRadius: 8, position: 'relative',
          background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="bell" size={17} color={DS.colors.textMid} />
          <span style={{
            position: 'absolute', top: 8, right: 9, width: 7, height: 7,
            borderRadius: 99, background: DS.colors.danger, border: '1.5px solid #fff',
          }} />
        </div>
      </div>
    </div>
  );
}
window.Topbar = Topbar;

// ── Web Content Wrapper ─────────────────────────────────
function WebContent({ children, maxWidth = 1120 }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: DS.colors.bg }}>
      <div style={{ maxWidth, margin: '0 auto', padding: '26px 32px 60px' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: DS.colors.bg, border: `1px solid ${DS.colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon name={icon} size={17} color={accent} /></div>
        {trend && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: trend.up ? DS.colors.success : DS.colors.danger }}>
            <Icon name={trend.up ? 'trending' : 'trending'} size={13} color={trend.up ? DS.colors.success : DS.colors.danger} /> {trend.value}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: DS.colors.textMuted, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 25, fontWeight: 700, color: DS.colors.text, marginTop: 4, letterSpacing: -0.6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: DS.colors.textMuted, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}
window.StatTile = StatTile;

// ── Web Section Title ───────────────────────────────────
function WebSection({ children, action, onAction, style = {} }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, marginTop: 4, ...style }}>
      <span style={{ fontSize: 14.5, fontWeight: 700, color: DS.colors.text, letterSpacing: -0.2 }}>{children}</span>
      {action && (
        <span onClick={onAction} style={{ fontSize: 12.5, color: DS.colors.primaryMid, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {action}
        </span>
      )}
    </div>
  );
}
window.WebSection = WebSection;

// ── Modal ───────────────────────────────────────────────
function Modal({ children, onClose, width = 480 }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(15,23,42,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: DS.colors.card, borderRadius: 14, width: '100%', maxWidth: width,
        maxHeight: '88%', overflowY: 'auto', boxShadow: '0 24px 60px rgba(15,23,42,0.25)',
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
        <div style={{ fontSize: 17, fontWeight: 700, color: DS.colors.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: DS.colors.textMuted, marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div onClick={onClose} style={{
        width: 30, height: 30, borderRadius: 7, background: DS.colors.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}><Icon name="x" size={15} color={DS.colors.textMid} /></div>
    </div>
  );
}
window.ModalHeader = ModalHeader;

// ── Data Table ──────────────────────────────────────────
function DataTable({ columns, rows, renderCell }) {
  const gridCols = columns.map(c => c.width || '1fr').join(' ');
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, padding: '12px 20px', background: DS.colors.bg, borderBottom: `1px solid ${DS.colors.border}` }}>
        {columns.map(c => (
          <span key={c.key} style={{ fontSize: 11, fontWeight: 700, color: DS.colors.textMuted, letterSpacing: 0.4, textAlign: c.align || 'left' }}>{c.label.toUpperCase()}</span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: gridCols,
          padding: '13px 20px', alignItems: 'center',
          borderBottom: i < rows.length - 1 ? `1px solid ${DS.colors.border}` : 'none',
        }}>
          {columns.map(c => (
            <div key={c.key} style={{ textAlign: c.align || 'left' }}>{renderCell(row, c.key)}</div>
          ))}
        </div>
      ))}
    </Card>
  );
}
window.DataTable = DataTable;
