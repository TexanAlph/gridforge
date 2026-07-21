import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const sourceFiles = [
  'index.html',
  'src/main.tsx',
  'src/styles.css',
  'src/data/sampleScenario.ts',
  'src/data/scenarioLibrary.ts',
  'src/components/TechnicalDiagram.tsx',
]

const disallowed = [
  /\bfetch\s*\(/i,
  /XMLHttpRequest/i,
  /\baxios\b/i,
  /supabase/i,
  /openai\.com/i,
  /api[_-]?key/i,
  /@import\s+url/i,
  /https?:\/\//i,
]

const violations = []
for (const relativePath of sourceFiles) {
  const contents = await readFile(join(root, relativePath), 'utf8')
  for (const pattern of disallowed) {
    if (pattern.test(contents)) violations.push(`${relativePath} matches ${pattern}`)
  }
}

const scenarioLibrary = await readFile(join(root, 'src/data/scenarioLibrary.ts'), 'utf8')
const authoredScenarioCount = (scenarioLibrary.match(/makeScenario\(\{/g) ?? []).length + 1
if (authoredScenarioCount !== 15) {
  violations.push(`expected 15 baked-in scenarios, found ${authoredScenarioCount}`)
}

const scenarioGroups = ['electricalScenarios', 'powerScenarios', 'coolingScenarios']
for (const group of scenarioGroups) {
  if (!scenarioLibrary.includes(`const ${group}: Scenario[]`)) {
    violations.push(`missing ${group}`)
  }
}

try {
  const productionHtml = await readFile(join(root, 'dist', 'index.html'), 'utf8')
  if (/https?:\/\//i.test(productionHtml)) {
    violations.push('production HTML references an external resource')
  }
  const assetReferences = [...productionHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1])
  if (assetReferences.some((asset) => !asset.startsWith('/assets/') && asset !== '/manifest.webmanifest')) {
    violations.push('production HTML includes a non-local asset reference')
  }
} catch {
  violations.push('production bundle not found; run npm run build first')
}

if (violations.length) {
  console.error('Keyless verification failed:\n' + violations.map((item) => `- ${item}`).join('\n'))
  process.exit(1)
}

console.log(`Keyless verification passed: ${authoredScenarioCount} baked-in scenarios, no runtime API or external-resource calls.`)
