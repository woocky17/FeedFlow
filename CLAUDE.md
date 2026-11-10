@AGENTS.md

# Claude Code en FeedFlow

Lo común a cualquier herramienta está en `AGENTS.md` (importado arriba). Aquí solo lo propio de Claude Code.

## Herramientas del proyecto

```
.claude/agents/      ff-researcher, ff-api-explorer, ff-implementer, ff-reviewer, ff-debugger
.claude/skills/      estado y openspec-* (apply-change, archive-change, explore, propose, sync-specs, update-change, verify-change)
.claude/commands/    ctx
.claude/hooks/       session-banner.mjs (SessionStart)
```

### Agentes

| Agente | Para qué |
|--------|----------|
| `ff-researcher` | Investiga cómo resuelven otros proyectos o librerías una feature, propone opciones y un borrador de requisitos para `/openspec-propose` |
| `ff-api-explorer` | Encuentra la API exacta (firma y evidencia `ruta:línea`) |
| `ff-implementer` | Implementa un grupo de tareas de un change; es el único que edita |
| `ff-reviewer` | Revisa el diff y los artefactos del change; hallazgos Bloqueante/Importante/Menor y si está listo para archivar |
| `ff-debugger` | Busca el primer error en tests, lint, tsc y logs, y su causa |

Las reglas detalladas de código están en `.claude/agents/ff-implementer.md`.

### Skills y comandos

- `/estado`: pone al día al empezar sesión leyendo `docs/estado.md`, la versión, git, los changes y specs de OpenSpec y el último arranque. Solo lectura.
- `/ctx <area>`: carga `docs/dev/<area>.md` y, para las áreas de comportamiento, la spec de OpenSpec correspondiente.
- `/pendientes` (skill global): menú con los pendientes de `docs/estado.md` y tandas de agentes con lo elegido.
- `openspec-propose`, `openspec-apply-change`, `openspec-verify-change`, `openspec-archive-change`, `openspec-explore`, `openspec-sync-specs`, `openspec-update-change`: el ciclo de los changes de OpenSpec.

### Hook

`session-banner.mjs` (SessionStart, configurado en `.claude/settings.json`): muestra al arrancar las skills del proyecto y la tabla de agentes, leyendo `.claude/skills/*/SKILL.md` y `.claude/agents/*.md`.

## Flujo de trabajo con agentes

Cada feature es un change de OpenSpec (`openspec/changes/<id>/`):

| Fase | Quién | Dónde |
|------|-------|-------|
| Investigar | `ff-researcher` + `ff-api-explorer` | agentes |
| Explorar (opcional) | `/openspec-explore` | sesión principal |
| Proponer | `/openspec-propose` | sesión principal: decide el usuario; un agente en segundo plano no puede preguntarle |
| Aplicar | `ff-implementer` | agente; una tanda = un grupo de `tasks.md` |
| Verificar | `ff-reviewer` (reglas del repo) + `/openspec-verify-change` (código frente a spec) | agente + sesión principal |
| Si falla | `ff-debugger` | agente; el arreglo, otra tanda de `ff-implementer` |
| Archivar | `/openspec-archive-change` | sesión principal, tras la prueba del usuario |
| Commit | — | solo si se pide |

- Explorar, proponer y archivar en la sesión principal; investigar, aplicar, revisar y depurar en agentes.
- **Tandas pequeñas**: cada agente recibe una sola tanda acotada de tareas relacionadas. Lo que pida el usuario mientras trabaja va a la siguiente tanda, con un agente nuevo; nunca se le envía al que está en curso. Entre tandas se pasan los tests.
- Agentes que no tocan los mismos ficheros se lanzan en paralelo.
- Respuestas breves; lo decidido y lo pendiente va a `docs/`, no se queda en el chat.

## Nota de traspaso

`/estado` lee `docs/estado.md` al empezar y `/pendientes` despacha lo que queda (cuándo se actualiza, en `AGENTS.md`).

## Mantenimiento de lo propio de Claude

- Cada trampa nueva → reglas de `ff-implementer` **y** checklist de `ff-reviewer`.
- Agente, skill o hook nuevo → este fichero.
- Lo común (estructura, reglas, comandos) va en `AGENTS.md`, no aquí. Este fichero no pasa de 150 líneas.
