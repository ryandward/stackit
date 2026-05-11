import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'

type ColorToken = { name: string; group: 'surface' | 'border' | 'foreground' | 'brand' | 'status' }

const colorTokens: ColorToken[] = [
  { name: '--bg-app',            group: 'surface' },
  { name: '--bg-subtle',         group: 'surface' },
  { name: '--bg-element',        group: 'surface' },
  { name: '--bg-hover',          group: 'surface' },
  { name: '--bg-active',         group: 'surface' },
  { name: '--border-subtle',     group: 'border' },
  { name: '--border',            group: 'border' },
  { name: '--border-hover',      group: 'border' },
  { name: '--fg',                group: 'foreground' },
  { name: '--fg-muted',          group: 'foreground' },
  { name: '--accent-bg',         group: 'brand' },
  { name: '--accent-bg-hover',   group: 'brand' },
  { name: '--accent-border',     group: 'brand' },
  { name: '--accent-solid',      group: 'brand' },
  { name: '--accent-solid-hover',group: 'brand' },
  { name: '--accent-text',       group: 'brand' },
  { name: '--on-accent',         group: 'brand' },
  { name: '--success',           group: 'status' },
  { name: '--warning',           group: 'status' },
  { name: '--danger',            group: 'status' },
]

const typeStyles = [
  { label: 'Micro 11',   sizeVar: '--text-micro-size',   trackVar: '--text-micro-track' },
  { label: 'Fine 13',    sizeVar: '--text-fine-size',    trackVar: '--text-fine-track' },
  { label: 'Body 14',    sizeVar: '--text-body-size',    trackVar: '--text-body-track' },
  { label: 'Heading 20', sizeVar: '--text-heading-size', trackVar: '--text-heading-track' },
]

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

function useResolvedTokens(names: string[]): Record<string, string> {
  const [resolved, setResolved] = useState<Record<string, string>>({})
  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement)
      const next: Record<string, string> = {}
      for (const name of names) next[name] = styles.getPropertyValue(name).trim()
      setResolved(next)
    }
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  // names is a stable constant in practice; safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return resolved
}

export function Style() {
  const resolved = useResolvedTokens(colorTokens.map(t => t.name))
  const grouped: Record<string, ColorToken[]> = {}
  for (const t of colorTokens) {
    if (!grouped[t.group]) grouped[t.group] = []
    grouped[t.group]!.push(t)
  }

  return (
    <div className="pane">
      <h1>Style</h1>
      <p className="lead">
        Storyboard of the stackit design system. Type scale, colour intents,
        button variants, and status indicators rendered live. Flip the theme
        switcher in the top bar to watch each intent re-tone.
      </p>

      <section className="style-section">
        <h2>Typography</h2>
        {typeStyles.map(t => (
          <div key={t.label} className="style-row">
            <span className="style-label">{t.label}</span>
            <span style={{
              fontSize: `var(${t.sizeVar})`,
              letterSpacing: `var(${t.trackVar})`,
            }}>
              {SAMPLE}
            </span>
          </div>
        ))}
        <div className="style-row">
          <span className="style-label">Mono 13</span>
          <span className="text-mono" style={{
            fontSize: 'var(--text-fine-size)',
            letterSpacing: 'var(--text-fine-track)',
          }}>
            MATCH (u:User)-[:AFFILIATED_WITH]-&gt;(i:Institution)
          </span>
        </div>
      </section>

      <section className="style-section">
        <h2>Colour</h2>
        {Object.entries(grouped).map(([group, tokens]) => (
          <div key={group} className="style-group">
            <div className="style-group-label">{group}</div>
            {tokens.map(t => (
              <div key={t.name} className="style-row">
                <span className="swatch" style={{ background: `var(${t.name})` }} />
                <span className="text-mono fg">{t.name}</span>
                <span className="text-mono fg-muted push-end">{resolved[t.name] ?? ''}</span>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="style-section">
        <h2>Buttons</h2>
        <div className="cluster">
          <button className="button">Default</button>
          <button className="button" data-variant="primary">Primary</button>
          <button className="button" data-variant="ghost">Ghost</button>
          <button className="button button--icon" aria-label="Settings"><Settings /></button>
        </div>
      </section>

      <section className="style-section">
        <h2>Status</h2>
        <div className="cluster">
          {(['active', 'expiring', 'revoked'] as const).map(s => (
            <span key={s} data-status={s} className="cluster">
              <span className="dot" />
              <span className="text-status">{s}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
