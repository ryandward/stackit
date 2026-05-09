import {
  File, Database, FlaskConical, BookText, Link as LinkIcon,
  FolderOpen, GitBranch, Workflow, Share2, BarChart3,
  Users, Settings,
} from 'lucide-react'
import type { AppId } from '../types'

type Item = { id: string; name: string; Icon: typeof File; app?: AppId }
type Group = { label: string; items: Item[] }

const groups: Group[] = [
  {
    label: 'Resources',
    items: [
      { id: 'r-files',    name: 'Files',       Icon: File },
      { id: 'r-datasets', name: 'Datasets',    Icon: Database },
      { id: 'r-samples',  name: 'Samples',     Icon: FlaskConical },
      { id: 'r-papers',   name: 'Papers',      Icon: BookText },
      { id: 'r-links',    name: 'Magic Links', Icon: LinkIcon },
    ],
  },
  {
    label: 'Apps',
    items: [
      { id: 'a-files',   name: 'Files',   Icon: FolderOpen, app: 'files' },
      { id: 'a-graph',   name: 'Graph',   Icon: GitBranch,  app: 'graph' },
      { id: 'a-lineage', name: 'Lineage', Icon: Workflow,   app: 'lineage' },
      { id: 'a-sharing', name: 'Sharing', Icon: Share2,     app: 'sharing' },
      { id: 'a-view',    name: 'View',    Icon: BarChart3,  app: 'view' },
    ],
  },
  {
    label: 'Tenant',
    items: [
      { id: 't-members',  name: 'Members',  Icon: Users,    app: 'members' },
      { id: 't-settings', name: 'Settings', Icon: Settings },
    ],
  },
]

type Props = {
  activeApp: AppId
  onSelectApp: (app: AppId) => void
}

export function SideBar({ activeApp, onSelectApp }: Props) {
  return (
    <nav className="sidebar">
      {groups.map(g => (
        <div key={g.label} className="sidebar__group">
          <div className="sidebar__label">{g.label}</div>
          {g.items.map(({ id, name, Icon, app }) => (
            <a
              key={id}
              className="sidebar__link"
              data-active={app != null && activeApp === app ? 'true' : undefined}
              onClick={() => app && onSelectApp(app)}
            >
              <Icon />
              <span>{name}</span>
            </a>
          ))}
        </div>
      ))}
    </nav>
  )
}
