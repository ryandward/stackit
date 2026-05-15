/*
 * Demo seed. Provisions the `demo` tenant and creates one user
 * (Ryan), one institution (UW-Madison), and an :AFFILIATED_WITH
 * edge between them. Idempotent: safe to re-run.
 *
 * Run after migrations on a fresh deploy:
 *   pnpm --filter @stackit/server seed
 */

import { withAdmin, withTenant } from './db.js'
import { cypher } from './cypher.js'

const SLUG = 'demo'

async function seed() {
  await withAdmin(async client => {
    const r = await client.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM public.tenants WHERE slug = $1) AS exists`,
      [SLUG],
    )
    if (!r.rows[0]!.exists) {
      await client.query(`SELECT public.provision_tenant($1, $2)`, [
        SLUG,
        'Demo Tenant',
      ])
      console.log(`provisioned tenant ${SLUG}`)
    } else {
      console.log(`tenant ${SLUG} already provisioned`)
    }
  })

  await withTenant(SLUG, async ({ client, graph }) => {
    const userRes = await client.query<{ id: string }>(
      `INSERT INTO users (email, display_name)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
       RETURNING id`,
      ['ryan@stackit.bio', 'Ryan Ward'],
    )
    const userId = Number(userRes.rows[0]!.id)

    const instRes = await client.query<{ id: string }>(
      `WITH new_inst AS (
         INSERT INTO institutions (name, kind, country)
         SELECT $1, $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE name = $1)
         RETURNING id
       )
       SELECT id FROM new_inst
       UNION ALL
       SELECT id FROM institutions WHERE name = $1
       LIMIT 1`,
      ['University of Wisconsin-Madison', 'university', 'US'],
    )
    const instId = Number(instRes.rows[0]!.id)

    await cypher(client, graph, `MERGE (:User {id: $uid})`, { uid: userId })
    await cypher(client, graph, `MERGE (:Institution {id: $iid})`, { iid: instId })

    await cypher(
      client,
      graph,
      `MATCH (u:User {id: $uid}), (i:Institution {id: $iid})
       MERGE (u)-[a:AFFILIATED_WITH]->(i)
       ON CREATE SET
         a.role       = $role,
         a.start_year = $start_year`,
      {
        uid: userId,
        iid: instId,
        role: 'PhD candidate',
        start_year: 2018,
      },
    )

    console.log(`seeded user ${userId} affiliated with institution ${instId}`)
  })

  console.log('seed complete')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
