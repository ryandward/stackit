import { withTenant } from './db.js'
import { cypher } from './cypher.js'

export type InstitutionKind = 'university' | 'hospital' | 'tribal_nation' | 'other'

export type AffiliationProps = {
  role: string
  degree?: string
  start_year?: number
  end_year?: number
}

export type Affiliation = {
  institution: {
    id: number
    name: string
    kind: InstitutionKind
    country: string | null
  }
  role: string
  degree: string | null
  start_year: number | null
  end_year: number | null
}

export async function createUser(
  tenantSlug: string,
  email: string,
  displayName: string | null,
): Promise<{ id: number }> {
  return await withTenant(tenantSlug, async ({ client, graph }) => {
    await client.query('BEGIN')
    try {
      const r = await client.query<{ id: string }>(
        `INSERT INTO users (email, display_name) VALUES ($1, $2) RETURNING id`,
        [email, displayName],
      )
      const row = r.rows[0]
      if (!row) throw new Error('failed to create user')
      const id = Number(row.id)
      await cypher(client, graph, `CREATE (:User {id: $id})`, { id })
      await client.query('COMMIT')
      return { id }
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  })
}

export async function createInstitution(
  tenantSlug: string,
  name: string,
  kind: InstitutionKind,
  country: string | null,
): Promise<{ id: number }> {
  return await withTenant(tenantSlug, async ({ client, graph }) => {
    await client.query('BEGIN')
    try {
      const r = await client.query<{ id: string }>(
        `INSERT INTO institutions (name, kind, country) VALUES ($1, $2, $3) RETURNING id`,
        [name, kind, country],
      )
      const row = r.rows[0]
      if (!row) throw new Error('failed to create institution')
      const id = Number(row.id)
      await cypher(client, graph, `CREATE (:Institution {id: $id})`, { id })
      await client.query('COMMIT')
      return { id }
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  })
}

export async function addAffiliation(
  tenantSlug: string,
  userId: number,
  institutionId: number,
  props: AffiliationProps,
): Promise<void> {
  await withTenant(tenantSlug, async ({ client, graph }) => {
    await cypher(
      client,
      graph,
      `
        MATCH (u:User {id: $uid}), (i:Institution {id: $iid})
        CREATE (u)-[:AFFILIATED_WITH {
          role:       $role,
          degree:     $degree,
          start_year: $start_year,
          end_year:   $end_year
        }]->(i)
      `,
      {
        uid: userId,
        iid: institutionId,
        role: props.role,
        degree: props.degree ?? null,
        start_year: props.start_year ?? null,
        end_year: props.end_year ?? null,
      },
    )
  })
}

export type Member = {
  id: number
  email: string
  displayName: string | null
  affiliations: Affiliation[]
}

export async function listMembers(tenantSlug: string): Promise<Member[]> {
  return await withTenant(tenantSlug, async ({ client, graph }) => {
    const users = await client.query<{
      id: string
      email: string
      display_name: string | null
    }>(`SELECT id, email, display_name FROM users ORDER BY id`)

    if (users.rows.length === 0) return []

    type EdgeRow = {
      user_id: number
      institution_id: number
      role: string
      degree: string | null
      start_year: number | null
      end_year: number | null
    }
    const edges = await cypher<EdgeRow>(
      client,
      graph,
      `
        MATCH (u:User)-[a:AFFILIATED_WITH]->(i:Institution)
        RETURN {
          user_id:        u.id,
          institution_id: i.id,
          role:           a.role,
          degree:         a.degree,
          start_year:     a.start_year,
          end_year:       a.end_year
        }
      `,
    )

    const instIds = [...new Set(edges.map(e => e.institution_id))]
    const insts =
      instIds.length === 0
        ? { rows: [] as Array<{ id: string; name: string; kind: InstitutionKind; country: string | null }> }
        : await client.query<{
            id: string
            name: string
            kind: InstitutionKind
            country: string | null
          }>(
            `SELECT id, name, kind, country FROM institutions WHERE id = ANY($1::bigint[])`,
            [instIds],
          )
    const instMap = new Map(
      insts.rows.map(i => [
        Number(i.id),
        { id: Number(i.id), name: i.name, kind: i.kind, country: i.country },
      ]),
    )

    const affsByUser = new Map<number, Affiliation[]>()
    for (const e of edges) {
      const inst = instMap.get(e.institution_id)
      if (!inst) continue
      const list = affsByUser.get(e.user_id) ?? []
      list.push({
        institution: inst,
        role: e.role,
        degree: e.degree,
        start_year: e.start_year,
        end_year: e.end_year,
      })
      affsByUser.set(e.user_id, list)
    }

    return users.rows.map(u => ({
      id: Number(u.id),
      email: u.email,
      displayName: u.display_name,
      affiliations: affsByUser.get(Number(u.id)) ?? [],
    }))
  })
}

export async function getAffiliations(
  tenantSlug: string,
  userId: number,
): Promise<Affiliation[]> {
  return await withTenant(tenantSlug, async ({ client, graph }) => {
    type Row = {
      institution_id: number
      role: string
      degree: string | null
      start_year: number | null
      end_year: number | null
    }

    const rows = await cypher<Row>(
      client,
      graph,
      `
        MATCH (u:User {id: $uid})-[a:AFFILIATED_WITH]->(i:Institution)
        RETURN {
          institution_id: i.id,
          role:           a.role,
          degree:         a.degree,
          start_year:     a.start_year,
          end_year:       a.end_year
        }
      `,
      { uid: userId },
    )

    if (rows.length === 0) return []

    const ids = rows.map(r => r.institution_id)
    const insts = await client.query<{
      id: string
      name: string
      kind: InstitutionKind
      country: string | null
    }>(
      `SELECT id, name, kind, country FROM institutions WHERE id = ANY($1::bigint[])`,
      [ids],
    )
    const instMap = new Map(insts.rows.map(i => [Number(i.id), i]))

    return rows.map(r => {
      const inst = instMap.get(r.institution_id)
      if (!inst) throw new Error(`institution ${r.institution_id} not in PG`)
      return {
        institution: {
          id: Number(inst.id),
          name: inst.name,
          kind: inst.kind,
          country: inst.country,
        },
        role: r.role,
        degree: r.degree,
        start_year: r.start_year,
        end_year: r.end_year,
      }
    })
  })
}
