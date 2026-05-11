import { ChevronRight } from 'lucide-react'
import { ThemeSwitcher } from './ThemeSwitcher'

export function TopBar({ crumbs }: { crumbs: string[] }) {
  return (
    <header className="topbar">
      <div className="wordmark">
        <svg viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 2.5 L1 7 L7 11.5 L13 7 Z" fill="var(--accent-solid)" />
          <ellipse cx="7"   cy="4.7" rx="1.1" ry="0.55" fill="var(--brand-wells)" />
          <ellipse cx="4.6" cy="6.7" rx="1.1" ry="0.55" fill="var(--brand-wells)" />
          <ellipse cx="9.4" cy="6.7" rx="1.1" ry="0.55" fill="var(--brand-wells)" />
          <ellipse cx="7"   cy="8.7" rx="1.1" ry="0.55" fill="var(--brand-wells)" />
        </svg>
        <span>stackit</span>
      </div>
      <nav className="crumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={`${i}-${c}`} className="crumb">
            {i > 0 && <ChevronRight />}
            <span>{c}</span>
          </span>
        ))}
      </nav>
      <span className="tenant-tag">demo</span>
      <ThemeSwitcher />
    </header>
  )
}
