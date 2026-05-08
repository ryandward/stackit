import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Client } from 'pg'

const here = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(here, 'migrations')

const config = {
  host: process.env.PG_HOST ?? 'localhost',
  port: Number(process.env.PG_PORT ?? 54322),
  database: process.env.PG_DATABASE ?? 'stackit',
  user: process.env.PG_USER ?? 'stackit',
  password: process.env.PG_PASSWORD ?? 'stackit',
}

async function main() {
  const client = new Client(config)
  await client.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version    TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const applied = new Set(
      (await client.query<{ version: string }>(
        `SELECT version FROM public.schema_migrations`
      )).rows.map(r => r.version)
    )

    const files = (await readdir(migrationsDir))
      .filter(f => f.endsWith('.sql'))
      .sort()

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip   ${file}`)
        continue
      }
      console.log(`apply  ${file}`)
      const sql = await readFile(join(migrationsDir, file), 'utf8')
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query(
          `INSERT INTO public.schema_migrations (version) VALUES ($1)`,
          [file]
        )
        await client.query('COMMIT')
        console.log(`ok     ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }
  } finally {
    await client.end()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
