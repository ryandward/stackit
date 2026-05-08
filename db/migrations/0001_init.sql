-- Tenants registry. Lives in public; provisioning is an admin operation.
-- Slug constrained to safe identifier characters so we can splice it into
-- schema and graph names without further escaping.
CREATE TABLE IF NOT EXISTS public.tenants (
  id           BIGSERIAL PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE
                 CHECK (slug ~ '^[a-z][a-z0-9_]{1,30}$'),
  display_name TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provision a tenant: create its Postgres schema and AGE graph atomically.
-- search_path is set inside so create_graph lands in ag_catalog.
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

  RETURN v_id;
END;
$$;
