import { ChevronRight } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'

export function TopBar({ crumbs }: { crumbs: string[] }) {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 2.5 L1 7 L7 11.5 L13 7 Z" fill="var(--accent)" />
          <ellipse cx="7"   cy="4.7" rx="1.1" ry="0.55" fill="var(--accent)" opacity="0.5" />
          <ellipse cx="4.6" cy="6.7" rx="1.1" ry="0.55" fill="var(--accent)" opacity="0.5" />
          <ellipse cx="9.4" cy="6.7" rx="1.1" ry="0.55" fill="var(--accent)" opacity="0.5" />
          <ellipse cx="7"   cy="8.7" rx="1.1" ry="0.55" fill="var(--accent)" opacity="0.5" />
        </svg>
        <span>stackit</span>
      </div>
      <nav className="topbar__crumbs">
        {crumbs.map((c, i) => (
          <span key={`${i}-${c}`} className="topbar__crumb">
            {i > 0 && <ChevronRight className="topbar__crumb__sep" />}
            <span>{c}</span>
          </span>
        ))}
      </nav>
      <div className="cluster">
        <span className="pill">demo</span>
        <ThemeSwitcher />
      </div>
    </header>
  )
}
