# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de los favoritos (añadir, quitar y listar artículos favoritos y su uso en la portada) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `favorites`: añadir, quitar y listar artículos favoritos del usuario y filtrarlos en la portada.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
