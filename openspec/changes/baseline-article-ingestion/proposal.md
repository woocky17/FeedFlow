# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de la ingesta de artículos solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta el comportamiento actual de la ingesta: sync periódico por fuente, enrutado RSS/WorldNews, deduplicación por URL, tolerancia a fallos del parser RSS y de cada fuente, heal de artículos incompletos y contrato del backfill manual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `article-ingestion`: obtención periódica y manual de artículos desde las fuentes activas, su deduplicación y la reparación de artículos a los que les falta enriquecimiento.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
