/*
 * Demo seed. Provisions the `demo` tenant, ensures the demo
 * institution exists, and ensures each demo user has an
 * :AFFILIATED_WITH edge to it with current property values.
 * Idempotent: safe to re-run; property SETs converge to spec.
 *
 * Run after migrations on a fresh deploy:
 *   pnpm --filter @stackit/server seed
 */

import { withAdmin, withTenant } from './db.js'
import { cypher } from './cypher.js'

const SLUG = 'demo'

const INSTITUTION = {
  name: 'University of Wisconsin-Madison',
  kind: 'university' as const,
  country: 'US',
}

type DemoUser = {
  email: string
  displayName: string
  role: string
  startYear: number
  endYear: number | null
}

const USERS: DemoUser[] = [
  {
    email: 'ryan@stackit.bio',
    displayName: 'Ryan Ward',
    role: 'PhD candidate',
    startYear: 2019,
    endYear: 2024,
  },
  {
    email: 'cris@stackit.bio',
    displayName: 'Cristóbal Carrera Carriel',
    role: 'PhD candidate',
    startYear: 2019,
    endYear: 2024,
  },
]

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
    // Institution. No UNIQUE on name; the CTE returns the id whether
    // we just inserted or it was already there.
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
      [INSTITUTION.name, INSTITUTION.kind, INSTITUTION.country],
    )
    const instId = Number(instRes.rows[0]!.id)
    await cypher(client, graph, `MERGE (:Institution {id: $iid})`, {
      iid: instId,
    })

    for (const u of USERS) {
      const userRes = await client.query<{ id: string }>(
        `INSERT INTO users (email, display_name)
         VALUES ($1, $2)
         ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
         RETURNING id`,
        [u.email, u.displayName],
      )
      const userId = Number(userRes.rows[0]!.id)
      await cypher(client, graph, `MERGE (:User {id: $uid})`, { uid: userId })

      // Delete any existing edges between this user and institution,
      // then create exactly one with current properties. AGE has no
      // reliable "upsert with properties" on relationships, so delete-
      // and-recreate is the simplest way to converge.
      await cypher(
        client,
        graph,
        `MATCH (u:User {id: $uid})-[a:AFFILIATED_WITH]->(i:Institution {id: $iid})
         DELETE a`,
        { uid: userId, iid: instId },
      )

      await cypher(
        client,
        graph,
        `MATCH (u:User {id: $uid}), (i:Institution {id: $iid})
         CREATE (u)-[:AFFILIATED_WITH {
           role:       $role,
           start_year: $start_year,
           end_year:   $end_year
         }]->(i)`,
        {
          uid: userId,
          iid: instId,
          role: u.role,
          start_year: u.startYear,
          end_year: u.endYear,
        },
      )

      console.log(`seeded ${u.email} -> ${INSTITUTION.name}`)
    }
  })

  console.log('seed complete')
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
