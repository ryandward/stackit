-- Adds the entity-vertex bridge pattern: per-tenant `users` and
-- `institutions` tables in the Postgres schema, paired with `:User`
-- and `:Institution` vertices in the AGE graph that share the entity
-- row's primary key as their `id` property.
--
-- Affiliations live on the edge: `(User)-[:AFFILIATED_WITH {role,
-- degree, start_year, end_year}]->(Institution)`. Properties on the
-- edge, not on a separate triple. Labeled property graph, not RDF.

CREATE OR REPLACE FUNCTION public.provision_tenant(
  p_slug TEXT,
  p_display_name TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_id     BIGINT;
  v_schema TEXT := 'tenant_' || p_slug;
  v_graph  TEXT := 'tenant_' || p_slug || '_graph';
BEGIN
  IF p_slug !~ '^[a-z][a-z0-9_]{1,30}$' THEN
    RAISE EXCEPTION 'invalid tenant slug: %', p_slug;
  END IF;

  INSERT INTO public.tenants (slug, display_name)
  VALUES (p_slug, COALESCE(p_display_name, p_slug))
  RETURNING id INTO v_id;

  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', v_schema);

  PERFORM ag_catalog.create_graph(v_graph);

  EXECUTE format($f$
    CREATE TABLE %I.users (
      id           BIGSERIAL PRIMARY KEY,
      email        TEXT UNIQUE NOT NULL,
      display_name TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $f$, v_schema);

  EXECUTE format($f$
    CREATE TABLE %I.institutions (
      id         BIGSERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      kind       TEXT NOT NULL CHECK (kind IN
                  ('university', 'hospital', 'tribal_nation', 'other')),
      country    TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  $f$, v_schema);

  RETURN v_id;
END;
$$;


-- Backfill existing tenants with the new tables. Idempotent.
DO $$
DECLARE
  t RECORD;
  v_schema TEXT;
BEGIN
  FOR t IN SELECT slug FROM public.tenants LOOP
    v_schema := 'tenant_' || t.slug;

    EXECUTE format($f$
      CREATE TABLE IF NOT EXISTS %I.users (
        id           BIGSERIAL PRIMARY KEY,
        email        TEXT UNIQUE NOT NULL,
        display_name TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    $f$, v_schema);

    EXECUTE format($f$
      CREATE TABLE IF NOT EXISTS %I.institutions (
        id         BIGSERIAL PRIMARY KEY,
        name       TEXT NOT NULL,
        kind       TEXT NOT NULL CHECK (kind IN
                    ('university', 'hospital', 'tribal_nation', 'other')),
        country    TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    $f$, v_schema);
  END LOOP;
END;
$$;
