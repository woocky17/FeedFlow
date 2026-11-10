# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de las fuentes de noticias (alta, edición, activación, borrado, tipos de fuente y confidencialidad de la clave de API) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `sources`: gestión de fuentes de noticias por administradores, tipos de fuente con su validación, activación y desactivación, y confidencialidad de la clave de API.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
