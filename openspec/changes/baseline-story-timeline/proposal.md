# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de el Story Timeline (seguir un artículo como historia, emparejar artículos nuevos con las historias seguidas, timeline y dejar de seguir) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `story-timeline`: seguimiento de historias por usuario a partir de un artículo y su timeline de artículos relacionados.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
