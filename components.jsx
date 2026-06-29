
// MonoClaro — Shared Components & Design System
// ================================================

const DS = {
  colors: {
    primary:      'oklch(0.34 0.055 255)',
    primaryMid:   'oklch(0.46 0.07 255)',
    primaryLight: 'oklch(0.955 0.012 255)',
    primaryBg:    'oklch(0.975 0.006 255)',
    accent:       'oklch(0.48 0.07 230)',
    accentLight:  'oklch(0.955 0.015 230)',
    success:      'oklch(0.50 0.09 160)',
    successLight: 'oklch(0.96 0.022 160)',
    warning:      'oklch(0.60 0.10 70)',
    warningLight: 'oklch(0.96 0.03 75)',
    danger:       'oklch(0.50 0.13 25)',
    dangerLight:  'oklch(0.96 0.025 25)',
    text:         'oklch(0.24 0.018 255)',
    textMid:      'oklch(0.44 0.018 255)',
    textMuted:    'oklch(0.60 0.014 255)',
    border:       'oklch(0.915 0.006 255)',
    card:         '#ffffff',
    bg:           'oklch(0.975 0.004 255)',
  },
  radius: { sm: 6, md: 9, lg: 12, xl: 16, pill: 999 },
  font: "'Inter', -apple-system, sans-serif",
};
window.DS = DS;

// ── Pill Badge ──────────────────────────────────────────
function Badge({ children, color = DS.colors.primaryLight, textColor = DS.colors.primary, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: DS.radius.pill,
      background: color, color: textColor,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      ...style
    }}>{children}</span>
  );
}
window.Badge = Badge;

// ── Card ────────────────────────────────────────────────
function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: DS.colors.card,
      borderRadius: DS.radius.lg,
      padding: '16px',
      border: `1px solid ${DS.colors.border}`,
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}>{children}</div>
  );
}
window.Card = Card;

// ── Progress Bar ────────────────────────────────────────
function ProgressBar({ value, max, color = DS.colors.primary, bg = DS.colors.primaryLight, height = 8 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct > 85 ? DS.colors.danger : pct > 65 ? DS.colors.warning : color;
  return (
    <div style={{ borderRadius: DS.radius.pill, background: bg, height, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: barColor, borderRadius: DS.radius.pill,
        transition: 'width 0.5s ease'
      }} />
    </div>
  );
}
window.ProgressBar = ProgressBar;

// ── Input Field ─────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', prefix, readOnly }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: DS.colors.textMid, marginBottom: 5, letterSpacing: 0.3 }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${DS.colors.border}`,
        borderRadius: DS.radius.md, background: readOnly ? DS.colors.bg : '#fff',
        overflow: 'hidden'
      }}>
        {prefix && (
          <span style={{ padding: '0 10px', color: DS.colors.textMuted, fontSize: 14, borderRight: `1px solid ${DS.colors.border}` }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            flex: 1, border: 'none', outline: 'none',
            padding: '11px 12px', fontSize: 14,
            color: DS.colors.text, background: 'transparent',
            fontFamily: DS.font
          }}
        />
      </div>
    </div>
  );
}
window.Field = Field;

// ── Section Title ───────────────────────────────────────
function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: DS.colors.textMid, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {children}
      </span>
      {action && (
        <span onClick={onAction} style={{ fontSize: 12, color: DS.colors.primary, fontWeight: 600, cursor: 'pointer' }}>
          {action}
        </span>
      )}
    </div>
  );
}
window.SectionTitle = SectionTitle;

// ── Primary Button ──────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', style = {}, disabled = false }) {
  const variants = {
    primary:   { background: DS.colors.primary, color: '#fff', border: 'none' },
    secondary: { background: DS.colors.primaryLight, color: DS.colors.primary, border: 'none' },
    outline:   { background: 'transparent', color: DS.colors.primary, border: `1.5px solid ${DS.colors.primary}` },
    ghost:     { background: 'transparent', color: DS.colors.primary, border: 'none' },
    danger:    { background: DS.colors.danger, color: '#fff', border: 'none' },
    success:   { background: DS.colors.success, color: '#fff', border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderRadius: DS.radius.md, padding: '13px 20px',
      fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: DS.font, transition: 'opacity 0.15s',
      ...variants[variant], ...style
    }}>{children}</button>
  );
}
window.Btn = Btn;

// ── List Row ────────────────────────────────────────────
function Row({ icon, label, sublabel, right, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 0', cursor: onClick ? 'pointer' : 'default',
      borderBottom: `1px solid ${DS.colors.border}`,
    }}>
      {icon && (
        <div style={{
          width: 38, height: 38, borderRadius: DS.radius.md,
          background: danger ? DS.colors.dangerLight : DS.colors.primaryLight,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0
        }}>{icon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? DS.colors.danger : DS.colors.text }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: DS.colors.textMuted, marginTop: 2 }}>{sublabel}</div>}
      </div>
      {right && <div style={{ fontSize: 13, color: DS.colors.textMuted, flexShrink: 0 }}>{right}</div>}
      {onClick && <span style={{ color: DS.colors.border, fontSize: 16 }}>›</span>}
    </div>
  );
}
window.Row = Row;

// ── Screen Wrapper ──────────────────────────────────────
function Screen({ children, bg = DS.colors.bg, padding = true }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: bg, fontFamily: DS.font, overflow: 'hidden'
    }}>
      {children}
    </div>
  );
}
window.Screen = Screen;

// ── Screen Header ───────────────────────────────────────
function Header({ title, subtitle, onBack, right, dark }) {
  return (
    <div style={{
      padding: '16px 20px 12px',
      background: dark ? DS.colors.primary : DS.colors.card,
      borderBottom: dark ? 'none' : `1px solid ${DS.colors.border}`,
      flexShrink: 0,
    }}>
      {onBack && (
        <div onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: dark ? 'rgba(255,255,255,0.8)' : DS.colors.primary,
          fontSize: 13, fontWeight: 600, marginBottom: 8, cursor: 'pointer'
        }}>
          ← Volver
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 700,
            color: dark ? '#fff' : DS.colors.text, lineHeight: 1.2
          }}>{title}</div>
          {subtitle && <div style={{
            fontSize: 13, color: dark ? 'rgba(255,255,255,0.7)' : DS.colors.textMuted, marginTop: 3
          }}>{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}
window.Header = Header;

// ── Scrollable Content ──────────────────────────────────
function Scroll({ children, style = {} }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', ...style }}>
      {children}
    </div>
  );
}
window.Scroll = Scroll;

// ── Bottom Nav ──────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',    icon: '⊞', label: 'Inicio' },
  { id: 'factura',      icon: '◻',  label: 'Facturar' },
  { id: 'vencimientos', icon: '◷',  label: 'Venc.' },
  { id: 'topes',        icon: '◈',  label: 'Topes' },
  { id: 'perfil',       icon: '◯',  label: 'Perfil' },
];
window.NAV_ITEMS = NAV_ITEMS;

function BottomNav({ active, onNavigate }) {
  return (
    <div style={{
      display: 'flex', background: DS.colors.card,
      borderTop: `1px solid ${DS.colors.border}`,
      flexShrink: 0, paddingBottom: 4,
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        return (
          <div key={item.id} onClick={() => onNavigate(item.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '8px 4px 4px',
            cursor: 'pointer', gap: 3,
          }}>
            <div style={{
              fontSize: 20, lineHeight: 1,
              color: isActive ? DS.colors.primary : DS.colors.textMuted,
              filter: isActive ? 'none' : 'opacity(0.5)',
            }}>{item.icon}</div>
            <div style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? DS.colors.primary : DS.colors.textMuted,
              letterSpacing: 0.2,
            }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}
window.BottomNav = BottomNav;
