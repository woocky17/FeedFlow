# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de la traducción (idioma de la interfaz, cambio de idioma, traducción de artículos bajo demanda, prefetch de títulos en segundo plano y su uso en el feed) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `translation`: idioma de la interfaz y su resolución, cambio de idioma, traducción de artículos bajo demanda, prefetch periódico de títulos y presentación de traducciones en el feed.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
