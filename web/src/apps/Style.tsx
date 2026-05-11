import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'

type ColorGroup = 'surface' | 'border' | 'foreground' | 'brand' | 'status'

type ColorToken = { name: string; group: ColorGroup }

const colorTokens: ColorToken[] = [
  { name: '--bg-app',             group: 'surface' },
  { name: '--bg-subtle',          group: 'surface' },
  { name: '--bg-element',         group: 'surface' },
  { name: '--bg-hover',           group: 'surface' },
  { name: '--bg-active',          group: 'surface' },
  { name: '--border-subtle',      group: 'border' },
  { name: '--border',             group: 'border' },
  { name: '--border-hover',       group: 'border' },
  { name: '--fg',                 group: 'foreground' },
  { name: '--fg-muted',           group: 'foreground' },
  { name: '--accent-bg',          group: 'brand' },
  { name: '--accent-bg-hover',    group: 'brand' },
  { name: '--accent-border',      group: 'brand' },
  { name: '--accent-solid',       group: 'brand' },
  { name: '--accent-solid-hover', group: 'brand' },
  { name: '--accent-text',        group: 'brand' },
  { name: '--on-accent',          group: 'brand' },
  { name: '--success',            group: 'status' },
  { name: '--warning',            group: 'status' },
  { name: '--danger',             group: 'status' },
  { name: '--danger-hover',       group: 'status' },
]

const typeStyles = [
  { label: 'Micro 11',   sizeVar: '--text-micro-size',   trackVar: '--text-micro-track' },
  { label: 'Fine 13',    sizeVar: '--text-fine-size',    trackVar: '--text-fine-track' },
  { label: 'Body 14',    sizeVar: '--text-body-size',    trackVar: '--text-body-track' },
  { label: 'Heading 20', sizeVar: '--text-heading-size', trackVar: '--text-heading-track' },
]

const spaceTokens = [
  { name: 'nano',    cssVar: '--space-nano' },
  { name: 'tight',   cssVar: '--space-tight' },
  { name: 'element', cssVar: '--space-element' },
  { name: 'inline',  cssVar: '--space-inline' },
  { name: 'block',   cssVar: '--space-block' },
  { name: 'section', cssVar: '--space-section' },
]

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

function useResolvedTokens(names: readonly string[]): Record<string, string> {
  // Bump on theme change so the read below recomputes. We don't cache
  // resolved values in state; reading via getComputedStyle is cheap
  // and a synchronous read during render is robust to HMR adding /
  // removing tokens behind our back.
  const [, setTick] = useState(0)
  useEffect(() => {
    const obs = new MutationObserver(() => setTick(t => t + 1))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  if (typeof window === 'undefined') return {}
  const styles = getComputedStyle(document.documentElement)
  const resolved: Record<string, string> = {}
  for (const name of names) resolved[name] = styles.getPropertyValue(name).trim()
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
        Every design token in the system, rendered live through the same
        primitives the rest of the app uses. Flip the theme switcher in the
        top bar to watch each intent re-tone.
      </p>

      <h2>Typography</h2>
      <table className="data-table">
        <colgroup>
          <col style={{ width: '160px' }} />
          <col />
        </colgroup>
        <tbody>
          {typeStyles.map(t => (
            <tr key={t.label}>
              <td className="text-status">{t.label}</td>
              <td>
                <span style={{
                  fontSize: `var(${t.sizeVar})`,
                  letterSpacing: `var(${t.trackVar})`,
                }}>
                  {SAMPLE}
                </span>
              </td>
            </tr>
          ))}
          <tr>
            <td className="text-status">Mono 13</td>
            <td className="text-mono" style={{
              fontSize: 'var(--text-fine-size)',
              letterSpacing: 'var(--text-fine-track)',
            }}>
              MATCH (u:User)-[:AFFILIATED_WITH]-&gt;(i:Institution)
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Colour</h2>
      {Object.entries(grouped).map(([group, tokens]) => (
        <div key={group}>
          <h3>{group}</h3>
          <table className="data-table">
            <colgroup>
              <col style={{ width: '64px' }} />
              <col />
              <col style={{ width: '120px' }} />
            </colgroup>
            <tbody>
              {tokens.map(t => (
                <tr key={t.name}>
                  <td><span className="swatch" style={{ background: `var(${t.name})` }} /></td>
                  <td><span className="text-primary text-mono">{t.name}</span></td>
                  <td className="text-mono text-right">{resolved[t.name] ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <h2>Spacing</h2>
      <table className="data-table">
        <colgroup>
          <col style={{ width: '160px' }} />
          <col />
        </colgroup>
        <tbody>
          {spaceTokens.map(s => (
            <tr key={s.name}>
              <td className="text-status">{s.name}</td>
              <td><span className="bar" style={{ width: `var(${s.cssVar})` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Buttons</h2>
      <div className="cluster">
        <button className="button">Default</button>
        <button className="button" data-variant="primary">Primary</button>
        <button className="button" data-variant="destructive">Destructive</button>
        <button className="button" data-variant="ghost">Ghost</button>
        <button className="button button--icon" aria-label="Settings"><Settings /></button>
      </div>

      <h2>Status</h2>
      <div className="cluster">
        {(['active', 'expiring', 'revoked'] as const).map(s => (
          <span key={s} data-status={s} className="cluster">
            <span className="dot" />
            <span className="text-status">{s}</span>
          </span>
        ))}
      </div>

      <h2>Code</h2>
      <p>
        Inline code appears as <code>:AFFILIATED_WITH</code> in prose, picked
        out by font and <code>--accent-text</code> colour. No chip, no border,
        no background.
      </p>
    </div>
  )
}
