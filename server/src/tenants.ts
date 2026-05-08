import { withAdmin, assertSlug } from './db.js'

export async function provisionTenant(
  slug: string,
  displayName?: string,
): Promise<{ id: number; slug: string }> {
  assertSlug(slug)
  return await withAdmin(async client => {
    const result = await client.query<{ id: number }>(
      `SELECT public.provision_tenant($1, $2) AS id`,
      [slug, displayName ?? null],
    )
    const id = result.rows[0]?.id
    if (id == null) throw new Error('provision_tenant returned no id')
    return { id: Number(id), slug }
  })
}
