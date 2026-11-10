# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de las notificaciones (su generación periódica, el envío por email, la API de listado y lectura y la página de notificaciones) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `notifications`: generación periódica de notificaciones por categorías propias, aviso por email, API para listarlas y marcarlas como leídas, y página de notificaciones.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
