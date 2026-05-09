export function View() {
  return (
    <div className="pane">
      <h1 className="pane__title">View</h1>
      <p className="pane__intro">
        Cross-filter / heatmap viewer. Spectacle compiles a SourceExpr to SQL,
        ClickHouse executes, the canvas renders.
      </p>
      <div className="card">
        <p className="fg-muted">Placeholder — analytics layer (ClickHouse + Spectacle) lands later.</p>
      </div>
    </div>
  )
}
