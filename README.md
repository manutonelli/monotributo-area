# MonoClaro

App web de autogestión de monotributo para estudio contable.

## Estructura

- `index.html` — punto de entrada (React + Babel vía CDN)
- `components.jsx` — design system (colores, tipografía) y componentes base
- `web-icons.jsx` — set de íconos de línea SVG
- `web-components.jsx` — layout de escritorio (sidebar, topbar, tablas, modales)
- `web-screens-1.jsx` — Resumen, Facturación, Generar VEP
- `web-screens-2.jsx` — Vencimientos, Topes, Recategorización, Mi contador, Perfil
- `tweaks-panel.jsx` — panel de configuración en página

## Uso

Abrir `index.html` en el navegador. No requiere build: React, ReactDOM y Babel
se cargan desde CDN y los `.jsx` se transpilan en el cliente.

> Nota: para producción conviene migrar a un bundler (Vite) y precompilar el JSX
> en lugar de usar Babel en el navegador.

## Secciones

Resumen · Facturación · Generar VEP · Vencimientos · Control de topes ·
Recategorización · Mi contador · Perfil
