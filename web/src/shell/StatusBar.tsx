export function StatusBar() {
  return (
    <footer className="statusbar">
      <div className="statusbar__items">
        <span>tenant <span className="statusbar__strong">demo</span></span>
        <span>·</span>
        <span>graph <span className="statusbar__strong">tenant_demo_graph</span></span>
      </div>
      <div className="statusbar__items">
        <span>postgres :54322</span>
        <span>·</span>
        <span>last sync 2m ago</span>
      </div>
    </footer>
  )
}
