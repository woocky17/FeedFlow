# Proposal

## Why

FeedFlow no tiene specs: el comportamiento de la autenticación (registro, inicio y cierre de sesión, recuperación de contraseña, sesión con rol e idioma y protección de páginas y APIs) solo está en el código y en docs operativas con desfases. Documentarlo como baseline permite que `openspec/specs/` sea la fuente de verdad y que los cambios futuros se expresen como deltas sobre él.

## What Changes

- Se documenta como requisitos el comportamiento que ya existe, respaldado por el código actual.
- Sin cambios de código ni de comportamiento.

## Capabilities

### New Capabilities
- `auth`: identidad del usuario, sesión y control de acceso a páginas y APIs, incluido el rol de administrador.

### Modified Capabilities
- Ninguna.

## Impact

- Solo documentación bajo `openspec/`. No afecta a código, APIs, dependencias ni datos.
