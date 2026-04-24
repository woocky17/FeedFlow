# `src/components/` — Reglas de capa

**Atomic Design**: atoms → molecules → organisms → templates.

## Dónde va qué

- `atoms/` — primitivas sin lógica de negocio: `button`, `input`, `label`, `badge`, `loading-spinner`, `icon-button`, `error-text`.
- `molecules/` — combinaciones simples: `form-field`, `nav-link`, `empty-state`, `section-header`, `filter-pill`, `toast`.
- `organisms/` — con lógica/fetching: `login-form`, `register-form`, `forgot-password-form`.
- `templates/` — layouts: `auth-layout`, `app-layout`.

## Convenciones

- **Archivos**: `kebab-case.tsx`. Un componente por archivo.
- **Atoms y molecules**: añade `*.stories.tsx` coubicado (Storybook 10, addon-vitest + addon-a11y activados).
- **Client components**: `"use client"` en la primera línea cuando haya estado, efectos o handlers.
- **Server components** por defecto para cosas de solo render o que consultan datos.
- Usa **Radix UI** (`@radix-ui/themes`, `@radix-ui/react-icons`) para primitivas accesibles complejas (modales, dropdowns, tooltips) — no añadas otra lib sin justificación.
- **TailwindCSS v4** directo en JSX. `@apply` solo si repites el mismo combo >3 veces.
- Props tipadas con `interface` local; evita `any`.

## Qué NO va aquí

- Lógica de negocio (va en `application/`).
- Llamadas Prisma directas (pasa por `fetch('/api/...')` o instancia el caso de uso en una server page).
- Casos de uso importados directamente en client components — solo desde server.

## Al añadir un componente

1. Decide el nivel (atom / molecule / organism / template).
2. Crea `<nivel>/<kebab-name>.tsx`.
3. Añade `<nivel>/<kebab-name>.stories.tsx` si es atom o molecule.
4. Usa tokens Radix/Tailwind existentes antes de inventar.

> Para el inventario completo y patrones de componentes, lee `.claude/context/components.md`.
