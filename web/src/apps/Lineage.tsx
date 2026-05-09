export function Lineage() {
  return (
    <div className="pane">
      <h1 className="pane__title">Lineage</h1>
      <p className="pane__intro">
        Provenance tree for a selected file — the <code>derived_from</code> chain back to source.
      </p>
      <div className="card">
        <p className="fg-muted">Placeholder — recursive Cypher traversal over <code>:DERIVED_FROM</code> renders here.</p>
      </div>
    </div>
  )
}
