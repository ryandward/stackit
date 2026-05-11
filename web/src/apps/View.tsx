export function View() {
  return (
    <div className="pane">
      <h1>View</h1>
      <p className="lead">
        Cross-filter and heatmap viewer. Spectacle compiles a SourceExpr to SQL,
        ClickHouse executes, the canvas renders.
      </p>
      <div className="card">
        <p className="fg-muted">Placeholder. Analytics layer (ClickHouse + Spectacle) lands later.</p>
      </div>
    </div>
  )
}
