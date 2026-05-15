import { useEffect, useState } from 'react'
import type { Affiliation, Member } from '../types'
import { api } from '../lib/api'

const TENANT = 'demo'

export function Members() {
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api.get<Member[]>(`/tenants/${TENANT}/members`)
      .then(data => {
        if (!cancelled) setMembers(data)
      })
      .catch(err => {
        if (!cancelled) setError(String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="pane">
        <h1>Members</h1>
        <p className="lead">Failed to load: {error}</p>
      </div>
    )
  }

  if (members === null) {
    return (
      <div className="pane">
        <h1>Members</h1>
        <p className="lead">Loading.</p>
      </div>
    )
  }

  return (
    <div className="pane">
      <h1>Members</h1>
      <p className="lead">
        People in the demo tenant and their affiliations. Each row pulls
        intrinsic user data from the tenant's Postgres schema and joins
        to <code>:AFFILIATED_WITH</code> edges in the tenant's AGE graph.
      </p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Affiliations</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id}>
              <td><span className="text-primary text-mono">{m.email}</span></td>
              <td>{m.displayName ?? ''}</td>
              <td>
                {m.affiliations.length === 0 ? null : (
                  <div className="stack stack--tight">
                    {m.affiliations.map((a, i) => (
                      <AffiliationLine key={i} a={a} />
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AffiliationLine({ a }: { a: Affiliation }) {
  const qualifiers: string[] = []
  if (a.degree) qualifiers.push(`${a.degree} ${a.role}`)
  else qualifiers.push(a.role)
  const years = formatYears(a.start_year, a.end_year)
  if (years) qualifiers.push(years)

  return (
    <div className="text-fine text-nowrap">
      <span className="fg">{a.institution.name}</span>
      <span className="fg-muted tabular-nums"> · {qualifiers.join(' · ')}</span>
    </div>
  )
}

function formatYears(from: number | null, to: number | null): string {
  if (from && to) return `${from}-${to}`
  if (from) return `${from}-`
  if (to) return `-${to}`
  return ''
}
