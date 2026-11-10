# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de el News Bias Radar (agrupación de artículos de distintas fuentes en eventos, sentimiento y framing por artículo, y la vista comparativa del evento) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `bias-radar`: agrupación de artículos sobre el mismo suceso en eventos, análisis de sentimiento y framing, y la vista y API de cada evento.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
