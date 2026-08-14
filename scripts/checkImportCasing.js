import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const sourceRoots = [join(projectRoot, 'src'), join(projectRoot, 'server')]
const sourceExtensions = new Set(['.js', '.jsx'])
const importPattern =
  /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)['"]([^'"]+)['"]/g

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue

    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(entryPath))
    } else if (sourceExtensions.has(extname(entry.name))) {
      files.push(entryPath)
    }
  }

  return files
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile()
  } catch {
    return false
  }
}

async function resolveImport(sourceFile, specifier) {
  const basePath = resolve(dirname(sourceFile), specifier.split('?')[0])
  const candidates = extname(basePath)
    ? [basePath]
    : [
        `${basePath}.js`,
        `${basePath}.jsx`,
        `${basePath}.json`,
        `${basePath}.css`,
        join(basePath, 'index.js'),
        join(basePath, 'index.jsx'),
      ]

  for (const candidate of candidates) {
    if (await isFile(candidate)) return candidate
  }

  return null
}

async function findCasingMismatch(targetPath) {
  const segments = relative(projectRoot, targetPath).split(sep)
  let currentPath = projectRoot

  for (const segment of segments) {
    const names = await readdir(currentPath)

    if (names.includes(segment)) {
      currentPath = join(currentPath, segment)
      continue
    }

    const caseInsensitiveMatch = names.find(
      (name) => name.toLowerCase() === segment.toLowerCase(),
    )

    if (caseInsensitiveMatch) {
      return `${segment} should be ${caseInsensitiveMatch}`
    }

    return `missing path segment ${segment}`
  }

  return null
}

const sourceFiles = (
  await Promise.all(sourceRoots.map(collectSourceFiles))
).flat()
const failures = []

for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, 'utf8')

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1]

    if (!specifier.startsWith('.')) continue

    const resolvedImport = await resolveImport(sourceFile, specifier)

    if (!resolvedImport) {
      failures.push(
        `${relative(projectRoot, sourceFile)}: unresolved import ${specifier}`,
      )
      continue
    }

    const mismatch = await findCasingMismatch(resolvedImport)

    if (mismatch) {
      failures.push(
        `${relative(projectRoot, sourceFile)}: ${specifier} (${mismatch})`,
      )
    }
  }
}

if (failures.length) {
  console.error('Import path QA failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exitCode = 1
} else {
  console.log(`Import path QA passed for ${sourceFiles.length} source files.`)
}
