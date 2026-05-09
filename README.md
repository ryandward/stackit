<p align="center">
  <img src="logo.svg" alt="stackit" width="120">
</p>

<h1 align="center">stackit</h1>
<p align="center"><strong>The instantaneous derivative of every well plate you have ever loaded.</strong></p>


***

[stackit](https://stackit.bio) is sensitive-data infrastructure for genomics. HIPAA-grade audit, sovereign deployment, no AWS, no big-tech cloud SaaS. Built for hospitals, research universities, and tribal nations who can't (or won't) put genome-scale datasets in someone else's cloud.

Site is live at [stackit.bio](https://stackit.bio).

## Architecture

stackit is two substrates solving two genuinely different problems.

**Metadata substrate.** A labeled property graph stored in Apache AGE inside Postgres. Users, datasets, papers, citations, sharing grants, viewing events, ontology relations are vertices and edges with properties. Same model Meta's TAO uses, same model Neo4j uses. Not a triple store. A property graph. Each customer gets their own Postgres schema and their own AGE graph. Cross-tenant access is impossible by construction, not by RLS policy.

**Analytics substrate.** ClickHouse for the billions-of-rows assay and plate data the metadata graph would never want to hold. Apache Arrow for IPC between the server and the cross-filter UI. Spectacle compiles a closed-algebra source expression into SQL, ClickHouse executes, the canvas renders. (Roadmap. See below.)

The two don't overlap. One handles networks of relationships. The other handles dense tabular numerics.

## Data flow (current)

```text
client (web)
   |
   v
fastify  -- per-request connection, search_path = tenant_<slug>
   |
   +-------------------------+--------------------------+
   |                         |                          |
   v                         v                          v
public.tenants     tenant_<slug>.users         tenant_<slug>_graph
public.provision   tenant_<slug>.institutions
   _tenant()
                              (:User {id})
                                  |
                                  | :AFFILIATED_WITH
                                  | { role, degree,
                                  |   start_year, end_year }
                                  v
                              (:Institution {id})
```

Entity rows in Postgres carry intrinsic data: email, password hash, file size, blob URI. Vertices in the AGE graph share the entity row's primary key as their `id` property. One logical thing, one ID. Cypher returns `(:User {id: 1})`. The application then SELECTs the full row from `users` by id when it needs more than the connections.

## Components

```
stackit/
  server/    TypeScript + Fastify + raw pg, per-request connection lifecycle
  web/       Vite + React 19, CUBE.CSS layers, Geist Variable, three themes
  db/        SQL migrations + a small runner
  infra/     Docker Compose (Postgres 16 + AGE 1.6.0)
  packages/  future home for vendored Spectacle
```

The frontend design system is grounded. Radix Slate (light + dark) is lifted verbatim for neutrals. A bespoke brand scale is anchored on `#6B5BFA` at step 9 along Radix's indigo-violet tonal curve. Status colours come from GitHub Primer (vetted for both modes). Geist Sans + Geist Mono. Single radius (4px). Five spacing stops, ordinal z-layers, one motion duration. Three themes: light, dark, midnight.

## Execution

```bash
git clone https://github.com/ryandward/stackit
cd stackit
docker compose -f infra/docker-compose.yml up -d
pnpm install
pnpm --filter @stackit/server migrate
pnpm --filter @stackit/server dev    # API on :3000
pnpm --filter @stackit/web    dev    # UI on :5173
```

Postgres listens on host port 54322. Apache AGE 1.6.0 is preloaded. If you cant figure this out you probably should not be cloning this repo.

## Roadmap

The layers below are not yet built.

### Vendored Spectacle

Stackit's visualization compiler ports from a prior project. Takes a closed 8-atom Codd-style source algebra (`table`, `values`, `filter`, `project`, `extend`, `aggregate`, `join`, `slice`), emits SQL for ClickHouse, returns Arrow IPC frames that drive a canvas2d cross-filter. The two-algebra split (source algebra inner, visual encoding outer) is the architectural distinguishing feature. It propagates functional dependencies through every rewrite so pivot operations are statically validated against the live grain.

### Append-only event log

Per-tenant `events` table. INSERT and SELECT only on the application role. No UPDATE, no DELETE, defended both by grant and by trigger. Catches every read, write, share, login, file open. Audit-grade by construction. The graph carries derived summary edges (first_at, last_at, count) for traversable queries; the event log remains the source of truth.

### Magic-link sharing

Short-lived tokens that grant access to a specific resource. Modeled as `:MagicLink` vertices with `:GRANTS_ACCESS_TO`, `:OPENED_BY`, `:CREATED_BY` edges. Permission resolution becomes a Cypher pattern over those edges. Cross-org sharing rides the same pattern.

### pgvector for content similarity

Embed each paper, dataset, file into a high-dimensional vector. Combine with property-graph traversal in the same query for two-tower-style "more like this" recommendations: graph for structural co-occurrence, vector for content similarity, blended score.

### ClickHouse analytics layer

The billions-of-rows substrate Spectacle targets. Server-side. Arrow IPC out. Replaces DuckDB-server in earlier framings; DuckDB-WASM may consume radix-quantized parquet sidecars in the browser for zero-latency cross-filter brushing.

## Status

Substrate in. Per-tenant Postgres + AGE isolation, entity-vertex bridge with shared IDs, first edge type live (`:AFFILIATED_WITH` with role / degree / start_year / end_year on the edge). Web UI scaffolds five app stubs (Files, Graph, Lineage, Sharing, View) with the constrained design system and three-mode theme switcher (light, dark, midnight) live.

You can not even handle what is next.
