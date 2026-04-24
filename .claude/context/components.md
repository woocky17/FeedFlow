# Componentes UI — Atomic Design + Radix + Tailwind v4

Carpeta: `src/components/`. Storybook: `npm run storybook` (port 6006).

## Atomic Design aplicado aquí

| Nivel | Propósito | Ejemplos existentes |
|-------|-----------|---------------------|
| `atoms/` | Primitivas sin lógica de negocio: botones, inputs, labels, badges, spinners, iconos | `button.tsx`, `input.tsx`, `label.tsx`, `badge.tsx`, `loading-spinner.tsx`, `icon-button.tsx`, `error-text.tsx` |
| `molecules/` | Combinaciones simples de atoms | `form-field.tsx`, `nav-link.tsx`, `empty-state.tsx`, `section-header.tsx`, `filter-pill.tsx`, `toast.tsx`, `toast-provider.tsx` |
| `organisms/` | Componentes con lógica o fetching, que orquestan moléculas | `login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx` |
| `templates/` | Layouts de página (sin datos concretos) | `auth-layout.tsx`, `app-layout.tsx` |

## Stories de Storybook

Todo atom/molecule nuevo debería tener su `*.stories.tsx` coubicado (ej. `button.stories.tsx`). Patrón típico:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta: Meta<typeof Button> = { title: "Atoms/Button", component: Button };
export default meta;

export const Default: StoryObj<typeof Button> = { args: { children: "Click" } };
export const Primary: StoryObj<typeof Button> = { args: { children: "Primary", variant: "primary" } };
```

Addons disponibles: `@storybook/addon-a11y` (accesibilidad), `@storybook/addon-vitest` (component testing desde stories), `@storybook/addon-docs`.

## Tailwind v4

- Config en `postcss.config` + `@tailwindcss/postcss`.
- Usa las clases utilitarias directamente en JSX. Evita `@apply` salvo para tokens repetidos.
- Tailwind 4 soporta `@theme` en CSS para definir tokens personalizados si hace falta.

## Radix UI

- `@radix-ui/themes` provee componentes estilados (Dialog, Dropdown, Tooltip…). Usar para primitivas complejas que requieren accesibilidad.
- `@radix-ui/react-icons` para iconos. No añadir otra lib de iconos sin justificación.

## Convenciones de componentes

- **Un componente por archivo**, nombre del archivo en kebab-case (`icon-button.tsx`), export nombrado o default consistente con los vecinos.
- Client components: `"use client"` en la primera línea. Usa client solo si hay estado, efectos o handlers de interacción.
- Server components (default en App Router) para datos/fetching. La mayoría de templates y pages son server por defecto.
- Props tipadas con interface local; evitar `any`.
- No mezclar lógica de fetching con presentación — extraer a casos de uso o hooks si crece.

## Al añadir un componente

1. Decide el nivel (atom/molecule/organism/template).
2. Crea `src/components/<nivel>/<name>.tsx`.
3. Añade `*.stories.tsx` coubicado si es atom/molecule.
4. Usa Radix para primitivas complejas (modales, dropdowns, tooltips).
5. Si introduces tokens/patrones repetidos, añade una nota aquí.
