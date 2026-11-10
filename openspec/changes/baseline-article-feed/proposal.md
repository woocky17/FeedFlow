# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de el feed de artículos (listado con filtros, orden, agrupación de artículos del mismo evento y portada) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `article-feed`: listado público de artículos con filtros por categoría y fuente, orden por fecha, agrupación de artículos del mismo evento y portada con sus tarjetas y filtros.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
