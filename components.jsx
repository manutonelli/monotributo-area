
// AreaGo — Shared Components & Design System
// ============================================
// Paleta y tokens del Manual de Marca AreaGo

const DS = {
  colors: {
    // Azules/Navy — identidad principal
    primary:      '#2A3548',   // Navy — fondos primarios, texto principal de acción
    primaryDeep:  '#1E2636',   // Navy profundo — sidebar, overlays oscuros
    primaryMid:   '#475779',   // Navy medio — estados hover en texto navy
    primaryLight: '#EEF1F7',   // Navy muy suave — bg de íconos, chips neutros

    // Verde — avance, acción, éxito (máx 10% de pantalla)
    accent:       '#2B9C6E',
    accentLight:  '#E6F4EE',

    // Semánticos
    success:      '#2B9C6E',
    successLight: '#E6F4EE',
    warning:      '#C98A2E',
    warningLight: '#FAF1E3',
    danger:       '#B23B3B',
    dangerLight:  '#F8E9E9',

    // Neutros de texto
    text:         '#2A3343',
    textMid:      '#5A6577',
    textMuted:    '#8A93A3',

    // Superficie
    border:       '#E6EAF0',
    card:         '#FFFFFF',
    bg:           '#F8FAFC',   // Paper — fondo general
  },
  radius: { sm: 6, md: 9, lg: 14, xl: 18, pill: 999 },
  font:        "'Inter', -apple-system, sans-serif",
  fontDisplay: "'Sora', 'Inter', sans-serif",     // Para títulos y display
  fontMono:    "'JetBrains Mono', monospace",
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
      borderRadius: DS.radius.lg,   // 14px según manual
      padding: '16px',
      border: `1px solid ${DS.colors.border}`,
      boxShadow: '0 1px 3px rgba(42,53,72,0.06)',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}>{children}</div>
  );
}
window.Card = Card;

// ── Progress Bar ────────────────────────────────────────
function ProgressBar({ value, max, color = DS.colors.accent, bg = DS.colors.accentLight, height = 8 }) {
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
      <div style={{ fontSize: 11.5, fontWeight: 700, color: DS.colors.textMid, marginBottom: 5, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${DS.colors.border}`,
        borderRadius: DS.radius.md, background: readOnly ? DS.colors.bg : '#fff',
        overflow: 'hidden',
        transition: 'border-color 0.15s',
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
            padding: '10px 12px', fontSize: 14,
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
      <span style={{ fontSize: 12, fontWeight: 700, color: DS.colors.textMid, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: DS.font }}>
        {children}
      </span>
      {action && (
        <span onClick={onAction} style={{ fontSize: 12, color: DS.colors.accent, fontWeight: 600, cursor: 'pointer' }}>
          {action}
        </span>
      )}
    </div>
  );
}
window.SectionTitle = SectionTitle;

// ── Button ──────────────────────────────────────────────
// Variantes del manual: primary (navy), secondary (verde claro), outline (borde sutil), ghost, danger, success (verde)
function Btn({ children, onClick, variant = 'primary', style = {}, disabled = false }) {
  const variants = {
    primary:   { background: DS.colors.primary, color: '#fff', border: 'none' },
    secondary: { background: DS.colors.accentLight, color: DS.colors.accent, border: 'none' },
    outline:   { background: 'transparent', color: DS.colors.primary, border: `1.5px solid ${DS.colors.border}` },
    ghost:     { background: 'transparent', color: DS.colors.primary, border: 'none' },
    danger:    { background: DS.colors.danger, color: '#fff', border: 'none' },
    success:   { background: DS.colors.accent, color: '#fff', border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      borderRadius: DS.radius.md, padding: '11px 18px',
      fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontFamily: DS.font, transition: 'opacity 0.15s, filter 0.15s',
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
          color: dark ? 'rgba(255,255,255,0.8)' : DS.colors.accent,
          fontSize: 13, fontWeight: 600, marginBottom: 8, cursor: 'pointer'
        }}>
          ← Volver
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontSize: 20, fontWeight: 700,
            color: dark ? '#fff' : DS.colors.text, lineHeight: 1.2,
            fontFamily: DS.fontDisplay,
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
              color: isActive ? DS.colors.accent : DS.colors.textMuted,
            }}>{item.icon}</div>
            <div style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? DS.colors.accent : DS.colors.textMuted,
              letterSpacing: 0.2,
            }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}
window.BottomNav = BottomNav;
