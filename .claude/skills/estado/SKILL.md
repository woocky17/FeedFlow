---
name: estado
description: Pone al día al empezar una sesión en FeedFlow leyendo del disco docs/estado.md, la versión, git, el código reciente, las traducciones y el último arranque, y propone el siguiente paso. Solo lectura. Úsala cuando el usuario escriba /estado o pregunte en qué punto está el proyecto.
---

# /estado — ponerse al día en FeedFlow

Todo se lee del disco, nunca de memoria. **No modifica nada.** Lanza las lecturas en paralelo, en este orden de prioridad:

## 0. Nota de traspaso
`docs/estado.md` entero. Su "Siguiente paso" manda, salvo que git o el log muestren que ya está hecho: en ese caso dilo y propone actualizar la nota.

## 1. Versión y docs
- `package.json` → `version`. Compárala con el último commit `vX.Y.Z:` (`git log --oneline --grep="^v[0-9]" -1`) y el último tag (`git tag --sort=-creatordate | head -1`). Avisa si no coinciden.
- `docs/`: los planes (`*-plan.md`) enteros; los análisis (`analisis-*.md`) solo por encabezados.

## 2. Git
- `git log --oneline -20`
- `git status --short`
- `git diff --stat`
- `git branch -a`
- Si hay cambios sin commitear: `git diff` (y `git diff --cached`).

## 3. Código
- Lo tocado recientemente, entero: ficheros de los últimos 3-5 commits (`git log -5 --name-only --format=`) y los modificados sin commitear.
- Del resto, solo los puntos de entrada: `src/app/api/**/route.ts` (verbos exportados), `src/app/(pages)/**/page.tsx`, `src/proxy.ts`, `src/worker/index.ts` (jobs registrados).
- Traducciones: compara las claves de `messages/es.json` y `messages/en.json` (claves que estén en una y no en la otra) y busca claves usadas con `useTranslations`/`getTranslations` + `t("…")` que no existan en `es.json`. Hazlo con un script de `node -e` de solo lectura.
- `TODO`, `FIXME`, `HACK` en `src/`, `scripts/`, `prisma/` y `test/`.

## 4. Último arranque
- `logs/dev.log`: fecha de modificación comparada con la del último commit (`git log -1 --format=%ci`). Si es más antiguo que el commit, dilo: lo último no se ha arrancado.
- Busca `✓ Ready in` (arranque correcto) y las líneas con `Error`, `⨯` o `error` propias del proyecto (rutas `src/`), ignorando ruido de terceros.
- Si no existe `logs/dev.log`, dilo y recuerda el comando: `mkdir -p logs && npm run dev 2>&1 | tee logs/dev.log`.
- No investigues la causa de un error: propone `ff-debugger`.

## Resumen
Breve, con estas secciones:

- **Estado**: versión, rama, HEAD, limpio o con cambios, probado o no.
- **Hecho**: por funcionalidad, no por commit.
- **En curso**: cambios sin commitear o plan abierto.
- **Último arranque**: fecha, si arrancó bien y errores propios.
- **Huecos**: claves de traducción que faltan, TODO/FIXME, desajustes de versión, docs desfasadas.
- **Siguiente paso**: qué hacer y qué agente del flujo toca (`ff-researcher` → `ff-api-explorer` → `ff-implementer` → `ff-reviewer` → `ff-debugger`).

Después espera instrucciones.
