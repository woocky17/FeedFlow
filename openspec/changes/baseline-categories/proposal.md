# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de las categorías (por defecto y propias del usuario, su gestión por usuarios y administradores y la clasificación automática de artículos) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `categories`: categorías por defecto y propias, su gestión desde la API y la interfaz, y la clasificación automática de artículos en las categorías por defecto.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
