import type { Client } from 'pg'

const GRAPH_RE = /^[a-z][a-z0-9_]+$/

export async function cypher<T = unknown>(
  client: Client,
  graph: string,
  query: string,
  params?: Record<string, unknown>,
): Promise<T[]> {
  // AGE requires graph_name and the cypher query to be SQL literals at parse
  // time — they can't be bound parameters. We inline both, and pass the
  // optional params map as a single agtype-cast JSON bind.
  if (!GRAPH_RE.test(graph)) {
    throw new Error(`invalid graph name: ${graph}`)
  }
  const tag = pickDollarTag(query)
  const sql = params
    ? `SELECT v::text AS v FROM cypher('${graph}', ${tag}${query}${tag}, $1::agtype) AS (v agtype)`
    : `SELECT v::text AS v FROM cypher('${graph}', ${tag}${query}${tag}) AS (v agtype)`
  const args = params ? [JSON.stringify(params)] : []
  const result = await client.query<{ v: string }>(sql, args)
  return result.rows.map(row => parseAgtype(row.v) as T)
}

function pickDollarTag(s: string): string {
  if (!s.includes('$$')) return '$$'
  for (let i = 1; i < 100; i++) {
    const tag = `$age${i}$`
    if (!s.includes(tag)) return tag
  }
  throw new Error('cannot pick a unique dollar tag for cypher query')
}

function parseAgtype(s: string): unknown {
  if (s === 'null') return null
  if (s === 'true') return true
  if (s === 'false') return false

  const stripped = stripTypeAnnotation(s)
  try {
    return JSON.parse(stripped)
  } catch {
    return stripped
  }
}

function stripTypeAnnotation(s: string): string {
  const idx = s.lastIndexOf('::')
  if (idx === -1) return s
  const tail = s.slice(idx + 2)
  if (/^[a-z]+$/.test(tail)) return s.slice(0, idx)
  return s
}
