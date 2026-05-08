import Fastify from 'fastify'
import { withTenant } from './db.js'
import { cypher } from './cypher.js'
import { provisionTenant } from './tenants.js'

const app = Fastify({ logger: true })

app.get('/health', async () => ({ status: 'ok' }))

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

const port = Number(process.env.PORT ?? 3000)
app
  .listen({ port, host: '0.0.0.0' })
  .then(() => app.log.info(`stackit server listening on :${port}`))
  .catch(err => {
    app.log.error(err)
    process.exit(1)
  })
