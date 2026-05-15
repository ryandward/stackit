import Fastify from 'fastify'
import cors from '@fastify/cors'
import { withTenant } from './db.js'
import { cypher } from './cypher.js'
import { provisionTenant } from './tenants.js'
import {
  createUser,
  createInstitution,
  addAffiliation,
  getAffiliations,
  listMembers,
  type InstitutionKind,
} from './entities.js'

const app = Fastify({ logger: true })

const corsOrigin = process.env.CORS_ORIGIN
await app.register(cors, {
  origin: corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : true,
  credentials: true,
})

// Invite-token gate. Skipped for /health (Railway probes) and CORS preflight.
// When INVITE_TOKEN is unset the gate is disabled (local dev convenience).
const inviteToken = process.env.INVITE_TOKEN
app.addHook('onRequest', async (req, reply) => {
  if (req.url === '/health' || req.method === 'OPTIONS') return
  if (!inviteToken) return
  const sent = req.headers['x-invite-token']
  if (sent !== inviteToken) {
    return reply.code(401).send({ error: 'invalid invite token' })
  }
})

app.get('/health', async () => ({ status: 'ok' }))

// Behind the invite-token hook by design. The SPA hits this on the
// invite-gate submit to verify the token before storing it.
app.get('/verify', async () => ({ status: 'ok' }))

app.post<{ Body: { slug: string; displayName?: string } }>(
  '/tenants',
  async (req) => {
    const { slug, displayName } = req.body
    return await provisionTenant(slug, displayName)
  },
)

app.get<{ Params: { slug: string } }>(
  '/tenants/:slug/hello',
  async (req) => {
    const { slug } = req.params
    return await withTenant(slug, async ({ client, graph }) => {
      await cypher(client, graph, `
        MERGE (n:Greeting {text: 'hello from stackit'})
        RETURN n.text
      `)
      const greetings = await cypher<{ text: string }>(client, graph, `
        MATCH (n:Greeting) RETURN n.text AS text
      `)
      return { graph, greetings }
    })
  },
)

app.post<{
  Params: { slug: string }
  Body: { email: string; displayName?: string }
}>('/tenants/:slug/users', async (req) => {
  const { slug } = req.params
  const { email, displayName } = req.body
  return await createUser(slug, email, displayName ?? null)
})

app.post<{
  Params: { slug: string }
  Body: { name: string; kind: InstitutionKind; country?: string }
}>('/tenants/:slug/institutions', async (req) => {
  const { slug } = req.params
  const { name, kind, country } = req.body
  return await createInstitution(slug, name, kind, country ?? null)
})

app.post<{
  Params: { slug: string }
  Body: {
    userId: number
    institutionId: number
    role: string
    degree?: string
    startYear?: number
    endYear?: number
  }
}>('/tenants/:slug/affiliations', async (req) => {
  const { slug } = req.params
  const { userId, institutionId, role, degree, startYear, endYear } = req.body
  await addAffiliation(slug, userId, institutionId, {
    role,
    ...(degree !== undefined ? { degree } : {}),
    ...(startYear !== undefined ? { start_year: startYear } : {}),
    ...(endYear !== undefined ? { end_year: endYear } : {}),
  })
  return { ok: true }
})

app.get<{
  Params: { slug: string; userId: string }
}>('/tenants/:slug/users/:userId/affiliations', async (req) => {
  const { slug, userId } = req.params
  return await getAffiliations(slug, Number(userId))
})

app.get<{ Params: { slug: string } }>(
  '/tenants/:slug/members',
  async (req) => {
    const { slug } = req.params
    return await listMembers(slug)
  },
)

const port = Number(process.env.PORT ?? 3000)
app
  .listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`stackit server listening on :${port}`))
  .catch(err => {
    app.log.error(err)
    process.exit(1)
  })
