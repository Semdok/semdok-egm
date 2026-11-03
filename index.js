// Semdok Design Review: Google's Elephant-Goldfish Model (EGM) skills for Semdok Harness. EGM's skills, reviewer
// personas and document standards are vendored unchanged under egm/; this file registers each skill with Semdok's
// skill registry and points it at the vendored files and at egm/docs/semdok.md, the Semdok integration guide.
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'semdok-egm'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, 'egm')
const slash = path => path.replace(/\\/g, '/')

// The SKILL.md frontmatter uses plain `key: value` lines and folded `key: >-` blocks only.
export function parseSkill(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) throw new Error('missing frontmatter')
  const meta = {}
  const lines = match[1].split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const field = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(lines[i])
    if (!field) continue
    let value = field[2].trim()
    if (/^[>|]-?$/.test(value)) {
      const block = []
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) block.push(lines[++i].trim())
      value = block.join(' ')
    }
    meta[field[1]] = value.replace(/^(['"])(.*)\1$/, '$2')
  }
  return { meta, body: raw.slice(match[0].length) }
}

// Swap the Codex and Claude Code integration pointers for the Semdok guide, and resolve the plugin root.
export function adaptBody(body, root, skillDir) {
  const guide = `${root}/docs/semdok.md`
  const lines = body.split(/\r?\n/).filter(line => !/^When running in Codex or ChatGPT Work, first read/.test(line))
  const text = lines.join('\n')
    .replace(/^In Claude Code or Cowork, read `\$\{CLAUDE_PLUGIN_ROOT\}\/docs\/claude\.md` first\.$/m,
      `In Semdok Harness, first read \`${guide}\`.`)
    .replaceAll('${CLAUDE_PLUGIN_ROOT}', root)
    .replaceAll('Codex: `spawn_agent`)', 'Codex: `spawn_agent`; Semdok Harness: `subagent`)')
  const header = [
    `EGM root: \`${root}\`. Resolve \`agents/\`, \`resources/\`, and \`docs/\` against the EGM root, and`,
    `\`references/\` against this skill's base directory (\`${skillDir}\`).`,
    `Semdok Harness guide: \`${guide}\`. Read it before the first step.`,
  ].join('\n')
  return `${header}\n\n${text.trim()}\n`
}

export function loadSkills(root = ROOT) {
  const skills = []
  for (const entry of readdirSync(join(root, 'skills'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = join(root, 'skills', entry.name)
    const file = join(dir, 'SKILL.md')
    const { meta, body } = parseSkill(readFileSync(file, 'utf8'))
    if (meta.name !== entry.name || !meta.description) throw new Error(`semdok-egm: invalid ${slash(file)}`)
    skills.push({
      name: meta.name,
      description: meta.description,
      path: file,
      source: 'runtime',
      // EGM skills run only when the user asks for them, as upstream intends.
      invocation: { modelInvocable: meta['disable-model-invocation'] !== 'true', userInvocable: true },
      resourceBase: { kind: 'directory', path: dir },
      content: adaptBody(body, slash(root), slash(dir)),
    })
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

function guideSkill(root, skills) {
  const list = skills.map(skill => `- \`/${skill.name}\`: ${skill.description}`).join('\n')
  return {
    name: 'egm',
    description: 'Elephant-Goldfish Model design workflow: brainstorm an idea, draft a design document, and review it with fresh-context reviewers before coding.',
    whenToUse: 'When the user wants to brainstorm, write, or review a design document, spec, or RFC, or asks about EGM.',
    source: 'runtime',
    resourceBase: { kind: 'directory', path: root },
    content: [
      'The Elephant-Goldfish Model (EGM, by Google) is installed. The Elephant (you, with the full project context)',
      'drafts a design; Goldfish reviewers (fresh subagents with no conversation history) review it; the user makes the',
      'trade-offs and approves it.',
      '',
      'The EGM skills run when the user starts a message with their command:',
      '',
      list,
      '',
      'When the user asks for one of these in plain words, suggest the command, for example',
      '"Start a message with /egm-review docs/designs/rate_limit.md". If they ask you to go ahead now, read',
      `\`${slash(root)}/docs/semdok.md\` and then \`${slash(root)}/skills/<name>/SKILL.md\` and follow it in this thread.`,
      'Use EGM for features that need design decisions before implementation, not for small, clear bug fixes.',
    ].join('\n'),
  }
}

export function apply(ctx) {
  const skills = loadSkills()
  ctx.plugin({
    name: 'semdok-egm-skills',
    inject: ['skills'],
    apply(child) {
      for (const skill of skills) child.skills.register(skill)
      child.skills.register(guideSkill(ROOT, skills))
    },
  })
}
