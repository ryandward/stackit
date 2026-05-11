import { Lock } from 'lucide-react'

export function StatusBar() {
  return (
    <footer className="statusbar">
      <div data-status="active">
        <span className="dot" />
        <span>connected</span>
      </div>
      <div>
        <Lock />
        <span>encrypted</span>
      </div>
      <div>
        <span>last sync</span>
        <span className="fg">2m ago</span>
      </div>
      <div className="push-end">
        <kbd>⌘K</kbd>
        <span>palette</span>
      </div>
    </footer>
  )
}
