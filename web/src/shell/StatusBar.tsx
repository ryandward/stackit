export function StatusBar() {
  return (
    <footer className="statusbar">
      <div data-status="active">
        <span className="dot" />
        <span>connected</span>
      </div>
      <div>
        <span>tenant</span>
        <span className="fg">demo</span>
      </div>
      <div>
        <span>graph</span>
        <span className="fg">tenant_demo_graph</span>
      </div>
      <div className="push-end">
        <span>postgres</span>
        <span className="fg">:54322</span>
      </div>
      <div>
        <span>api</span>
        <span className="fg">:3000</span>
      </div>
      <div>
        <kbd>⌘K</kbd>
        <span>palette</span>
      </div>
    </footer>
  )
}
