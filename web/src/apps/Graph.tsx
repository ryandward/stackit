export function Graph() {
  return (
    <div className="pane">
      <h1>Graph</h1>
      <p className="lead">
        Force-directed view of an entity's neighborhood in the metadata property graph.
        Wire to AGE next.
      </p>
      <div className="card">
        <p className="fg-muted">
          Placeholder. Cypher queries against <code>tenant_&lt;slug&gt;_graph</code> render here.
        </p>
      </div>
    </div>
  )
}
