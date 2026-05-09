export function Sharing() {
  return (
    <div className="pane">
      <h1 className="pane__title">Sharing</h1>
      <p className="pane__intro">
        Magic links and access grants. Who opened what, when, from where.
      </p>
      <div className="cluster">
        <span className="pill" data-status="success">3 active</span>
        <span className="pill" data-status="warning">1 expiring</span>
        <span className="pill" data-status="danger">0 revoked</span>
      </div>
    </div>
  )
}
