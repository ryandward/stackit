import { useState } from 'react'
import { ThemeProvider } from './theme/ThemeProvider'
import { TopBar } from './shell/TopBar'
import { SideBar } from './shell/SideBar'
import { StatusBar } from './shell/StatusBar'
import { Files } from './apps/Files'
import { Graph } from './apps/Graph'
import { Lineage } from './apps/Lineage'
import { Sharing } from './apps/Sharing'
import { View } from './apps/View'
import { Members } from './apps/Members'
import type { AppId } from './types'

const APPS = {
  files:   Files,
  graph:   Graph,
  lineage: Lineage,
  sharing: Sharing,
  view:    View,
  members: Members,
} as const

const TITLES: Record<AppId, string> = {
  files:   'Files',
  graph:   'Graph',
  lineage: 'Lineage',
  sharing: 'Sharing',
  view:    'View',
  members: 'Members',
}

export function App() {
  const [active, setActive] = useState<AppId>('files')
  const Pane = APPS[active]
  return (
    <ThemeProvider>
      <div className="shell">
        <TopBar crumbs={['Home', TITLES[active]]} />
        <div className="shell-body">
          <SideBar activeApp={active} onSelectApp={setActive} />
          <main className="shell-pane">
            <Pane />
          </main>
        </div>
        <StatusBar />
      </div>
    </ThemeProvider>
  )
}
