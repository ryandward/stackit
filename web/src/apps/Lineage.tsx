export function Lineage() {
  return (
    <div className="pane">
      <h1>Lineage</h1>
      <p className="lead">
        Provenance tree for a selected file. The <code>derived_from</code> chain back to source.
      </p>
      <div className="card">
        <p className="fg-muted">
          Placeholder. Recursive Cypher traversal over <code>:DERIVED_FROM</code> renders here.
        </p>
      </div>
    </div>
  )
}
