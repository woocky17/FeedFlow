// SessionStart: muestra al usuario las skills del proyecto y la tabla de agentes.
// Lee .claude/skills/*/SKILL.md y .claude/agents/*.md, así que lo nuevo aparece solo.
import fs from "node:fs";
import path from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const dir = (...p) => path.join(root, ".claude", ...p);
const TITLE = "FeedFlow · herramientas de Claude";

// Resúmenes cortos y orden del flujo de CLAUDE.md. Lo que no esté aquí usa su description recortada.
const SHORT = {
  estado: "Resume en qué punto está el proyecto y el siguiente paso",
  "openspec-explore": "Piensa una idea o problema antes de proponer",
  "openspec-propose": "Crea un change con propuesta, specs y tareas",
  "openspec-update-change": "Revisa los artefactos de un change ya creado",
  "openspec-apply-change": "Implementa las tareas de un change",
  "openspec-verify-change": "Comprueba que el código cumple el change",
  "openspec-sync-specs": "Pasa los deltas del change a las specs",
  "openspec-archive-change": "Archiva un change terminado",
  "ff-researcher": "Investiga cómo resuelven otros una feature",
  "ff-api-explorer": "Encuentra la API exacta y su evidencia",
  "ff-implementer": "Implementa un grupo de tasks.md (único que edita)",
  "ff-reviewer": "Revisa diff y change contra AGENTS.md y la spec",
  "ff-debugger": "Busca el primer error en logs y tests y su causa",
};
const ORDER = Object.keys(SHORT);

function frontmatter(file) {
  try {
    const text = fs.readFileSync(file, "utf8");
    const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!m) return null;
    const get = (k) => (new RegExp(`^${k}:\\s*(.+)$`, "m").exec(m[1]) || [])[1]?.trim();
    return { name: get("name"), description: get("description") || "" };
  } catch {
    return null;
  }
}

function summary(item) {
  if (SHORT[item.name]) return SHORT[item.name];
  const first = item.description.split(/[.(]/)[0].trim();
  return first.length > 60 ? first.slice(0, 57) + "..." : first;
}

function list(sub, pick) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir(sub), { withFileTypes: true });
  } catch {
    return [];
  }
  const items = entries.map((e) => pick(e)).filter(Boolean).map(frontmatter).filter((x) => x && x.name);
  const rank = (n) => (ORDER.includes(n) ? ORDER.indexOf(n) : ORDER.length);
  return items.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

const skills = list("skills", (e) => (e.isDirectory() ? dir("skills", e.name, "SKILL.md") : null));
const agents = list("agents", (e) => (e.isFile() && e.name.endsWith(".md") ? dir("agents", e.name) : null));

const lines = [TITLE, ""];
lines.push("Skills:");
if (skills.length === 0) lines.push("  (ninguna)");
for (const s of skills) lines.push(`  /${s.name.padEnd(24)} ${summary(s)}`);
lines.push("", "Agentes (flujo en orden):");
if (agents.length === 0) lines.push("  (ninguno)");
agents.forEach((a, i) => lines.push(`  ${i + 1}. ${a.name.padEnd(18)} ${summary(a)}`));

process.stdout.write(JSON.stringify({ systemMessage: lines.join("\n") }));
