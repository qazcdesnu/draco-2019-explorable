// 빌드 산출물(dist/)에 번들된 런타임 의존성의 라이선스 전문을 모은다.
// 압축된 번들에서는 라이선스 주석이 빠지므로, BSD/MIT/ISC의 고지 의무를 이 파일로 지킨다.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

// 의존성 이름 → 설치 위치 (중첩 node_modules까지 따라간다)
function resolve(name, from) {
  for (let dir = from; ; dir = dirname(dir)) {
    const p = join(dir, 'node_modules', name)
    if (existsSync(join(p, 'package.json'))) return p
    if (dir === root || dir === dirname(dir)) return null
  }
}

const seen = new Map()
function walk(name, from) {
  const dir = resolve(name, from)
  if (!dir || seen.has(dir)) return
  const meta = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  seen.set(dir, meta)
  for (const dep of Object.keys(meta.dependencies ?? {})) walk(dep, dir)
}
for (const dep of Object.keys(pkg.dependencies)) walk(dep, root)

const out = [
  'Third-party software bundled in this site',
  '==========================================',
  '',
]
const entries = [...seen.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name))
for (const [dir, meta] of entries) {
  const file = readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f))
  const license = typeof meta.license === 'string' ? meta.license : (meta.license?.type ?? 'UNKNOWN')
  out.push('-'.repeat(72), `${meta.name}@${meta.version} (${license})`, '-'.repeat(72))
  out.push(file ? readFileSync(join(dir, file), 'utf8').trim() : '(no license file in package)', '')
}

writeFileSync(join(root, 'dist', 'THIRD_PARTY_LICENSES.txt'), out.join('\n'))
console.log(`THIRD_PARTY_LICENSES.txt: ${entries.length} packages`)
