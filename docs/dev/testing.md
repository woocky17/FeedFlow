# Testing — Vitest

## Stack

- **Vitest 4** para unit e integration. Un único proyecto, `unit` (`vitest.config.ts`), entorno `node`. Sin cobertura configurada.
- **Storybook 10** solo como catálogo visual de componentes: las stories no se ejecutan como tests y no hay tests en navegador.
- No hay e2e ni Playwright instalado.
- **Prisma 7** trae `@prisma/adapter-pg` — los tests de integración pueden apuntar a una BD real de test o a una en memoria con `postgres-js`/Testcontainers (aún no establecido).

## Dónde viven los tests

- **Unit + integration tests**: en `test/` en la raíz, espejando el árbol de `src/`. Ejemplo: `src/application/article/sync-articles.ts` → `test/application/article/sync-articles.test.ts`. Sufijo `.integration.test.ts` si quieres separarlos del unit.
- Imports dentro del test usan los aliases `@/...` (mismo `tsconfig.paths` que el código), nunca rutas relativas a `src/`.

## Qué testear y cómo

### Dominio (unit)
- Cada entidad: invariantes en `create()` (lanzan `Error` con mensajes claros).
- Value objects y servicios de dominio puros.
- Sin mocks: es TS puro.

### Casos de uso (unit con mocks de puertos)
- Mockea los puertos (repositorios y servicios) con `vi.fn()` o un objeto stub que implementa la interfaz.
- Valida el orquestado: qué métodos se llaman y con qué argumentos, qué devuelve el caso de uso.
- Ejemplo de mock stub:
  ```ts
  const repo: UserRepository = {
    findByEmail: vi.fn().mockResolvedValue(null),
    save: vi.fn(),
    // …resto del puerto
  };
  ```

### Adaptadores Prisma (integration)
- Requieren BD real. Usa una `DATABASE_URL` de test y resetea entre tests.
- Considera `prisma migrate reset --skip-seed` antes del run o un `beforeEach` que trunque tablas, siempre contra una BD de test, nunca contra una real. Hoy no hay ninguno.

### Componentes
- Sin tests automáticos. Los `*.stories.tsx` sirven para revisar variantes a mano en Storybook (con el panel de accesibilidad de `addon-a11y`).

## Convenciones

- Nombres descriptivos: `describe("Story.create", () => { it("throws when name is empty", …) })`.
- Un `expect` por assertion lógica (no un mega-expect).
- Factories para construir entidades en tests: si repites la misma creación, extrae un `makeStory({…overrides})` helper en un archivo de test utilities.
- Nada de `console.log` en tests commiteados.

## Comandos

```bash
npx vitest              # unit/integration watch
npx vitest run          # one-shot
npm run storybook       # catálogo de componentes en :6006
```

Atajos del proyecto (ya en `package.json`):

```bash
npm test            # vitest run --project unit (los .test.ts en test/)
npm run test:watch  # watch mode sobre el mismo proyecto
```
