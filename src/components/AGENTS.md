# `src/components/` — Reglas de capa

**Atomic Design**: atoms → molecules → organisms → templates.

## Dónde va qué

- `atoms/` — primitivas sin lógica de negocio: `button`, `input`, `badge`, `loading-spinner`, `icon-button`, `error-text`.
- `molecules/` — combinaciones simples: `empty-state`, `section-header`, `filter-pill`, `entity-row`, `notification-item`.
- `organisms/` — con lógica/fetching: `login-form`, `register-form`, `forgot-password-form`.
- `templates/` — layouts: `auth-layout`, `app-layout`.

## Convenciones

- **Archivos**: `kebab-case.tsx`. Un componente por archivo.
- **Atoms y molecules**: recomendable tener `*.stories.tsx` coubicado en los nuevos para el catálogo (Storybook 10 solo como catálogo, con addon-a11y; las stories no se ejecutan como tests).
- **Client components**: `"use client"` en la primera línea cuando haya estado, efectos o handlers.
- **Server components** por defecto para cosas de solo render o que consultan datos.
- Usa **Radix UI** (`@radix-ui/themes`) para primitivas accesibles complejas (modales, dropdowns, tooltips) — no añadas otra lib sin justificación.
- **TailwindCSS v4** directo en JSX. `@apply` solo si repites el mismo combo >3 veces.
- Props tipadas con `interface` local; evita `any`.

## Qué NO va aquí

- Lógica de negocio (va en `application/`).
- Llamadas Prisma directas (pasa por `fetch('/api/...')` o instancia el caso de uso en una server page).
- Casos de uso importados directamente en client components — solo desde server.

## Al añadir un componente

1. Decide el nivel (atom / molecule / organism / template).
2. Crea `<nivel>/<kebab-name>.tsx`.
3. Si es atom o molecule, es recomendable añadir `<nivel>/<kebab-name>.stories.tsx` para el catálogo.
4. Usa tokens Radix/Tailwind existentes antes de inventar.

> Para el inventario completo y patrones de componentes, lee `docs/dev/components.md`.
