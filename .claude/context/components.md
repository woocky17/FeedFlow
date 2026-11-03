# Componentes UI — Atomic Design + Radix + Tailwind v4

Carpeta: `src/components/`. Storybook: `npm run storybook` (port 6006).

## Atomic Design aplicado aquí

| Nivel | Propósito | Ejemplos existentes |
|-------|-----------|---------------------|
| `atoms/` | Primitivas sin lógica de negocio: botones, inputs, badges, spinners, iconos | `button.tsx`, `input.tsx`, `badge.tsx`, `loading-spinner.tsx`, `icon-button.tsx`, `error-text.tsx` |
| `molecules/` | Combinaciones simples de atoms | `empty-state.tsx`, `section-header.tsx`, `filter-pill.tsx`, `entity-row.tsx`, `notification-item.tsx` |
| `organisms/` | Componentes con lógica o fetching, que orquestan moléculas | `login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx` |
| `templates/` | Layouts de página (sin datos concretos) | `auth-layout.tsx`, `app-layout.tsx` |

## Stories de Storybook

Storybook es solo un catálogo visual: las stories no se ejecutan como tests. Es recomendable tener `*.stories.tsx` coubicado en los atoms/molecules nuevos (ej. `button.stories.tsx`) para el catálogo. Patrón típico:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = { title: "Atoms/Button", component: Button };
export default meta;

export const Default: StoryObj<typeof Button> = { args: { children: "Click" } };
export const Primary: StoryObj<typeof Button> = { args: { children: "Primary", variant: "primary" } };
```

Addons disponibles: `@storybook/addon-a11y` (panel de accesibilidad) y `@storybook/addon-docs`. La toolbar tiene un selector de locale (`es`/`en`) en `.storybook/preview.tsx`.

## Tailwind v4

- Config en `postcss.config` + `@tailwindcss/postcss`.
- Usa las clases utilitarias directamente en JSX. Evita `@apply` salvo para tokens repetidos.
- Tailwind 4 soporta `@theme` en CSS para definir tokens personalizados si hace falta.

## Radix UI

- `@radix-ui/themes` provee componentes estilados (Dialog, Dropdown, Tooltip…). Usar para primitivas complejas que requieren accesibilidad.
- No hay lib de iconos instalada; no añadir una sin justificación.

## Convenciones de componentes

- **Un componente por archivo**, nombre del archivo en kebab-case (`icon-button.tsx`), export nombrado o default consistente con los vecinos.
- Client components: `"use client"` en la primera línea. Usa client solo si hay estado, efectos o handlers de interacción.
- Server components (default en App Router) para datos/fetching. La mayoría de templates y pages son server por defecto.
- Props tipadas con interface local; evitar `any`.
- No mezclar lógica de fetching con presentación — extraer a casos de uso o hooks si crece.

## Al añadir un componente

1. Decide el nivel (atom/molecule/organism/template).
2. Crea `src/components/<nivel>/<name>.tsx`.
3. Si es atom/molecule, es recomendable añadir `*.stories.tsx` coubicado para el catálogo.
4. Usa Radix para primitivas complejas (modales, dropdowns, tooltips).
5. Si introduces tokens/patrones repetidos, añade una nota aquí.
