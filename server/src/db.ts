import { Client, type ClientConfig } from 'pg'

const baseConfig: ClientConfig = {
  host: process.env.PG_HOST ?? 'localhost',
  port: Number(process.env.PG_PORT ?? 54322),
  database: process.env.PG_DATABASE ?? 'stackit',
  user: process.env.PG_USER ?? 'stackit',
  password: process.env.PG_PASSWORD ?? 'stackit',
}

const SLUG_RE = /^[a-z][a-z0-9_]{1,30}$/

export function assertSlug(slug: string): asserts slug is string {
  if (!SLUG_RE.test(slug)) {
    throw new Error(`invalid tenant slug: ${slug}`)
  }
}

export type TenantContext = {
  client: Client
  slug: string
  schema: string
  graph: string
}

export async function withTenant<T>(
  slug: string,
  fn: (ctx: TenantContext) => Promise<T>,
): Promise<T> {
  assertSlug(slug)
  const schema = `tenant_${slug}`
  const graph = `tenant_${slug}_graph`

  const client = new Client(baseConfig)
  await client.connect()
  try {
    await client.query(`LOAD 'age'`)
    await client.query(`SET search_path TO ${schema}, ag_catalog`)
    return await fn({ client, slug, schema, graph })
  } finally {
    await client.end()
  }
}

export async function withAdmin<T>(
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client(baseConfig)
  await client.connect()
  try {
    await client.query(`LOAD 'age'`)
    return await fn(client)
  } finally {
    await client.end()
  }
}
