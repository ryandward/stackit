export function StatusBar() {
  return (
    <footer className="statusbar">
      <div className="cluster">
        <span>tenant <span className="fg">demo</span></span>
        <span>·</span>
        <span>graph <span className="fg">tenant_demo_graph</span></span>
      </div>
      <div className="cluster">
        <span>postgres :54322</span>
        <span>·</span>
        <span>last sync 2m ago</span>
      </div>
    </footer>
  )
}
