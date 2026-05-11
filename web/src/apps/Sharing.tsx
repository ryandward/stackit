type Status = 'active' | 'expiring' | 'revoked'

type Link = {
  token: string
  target: string
  created: string
  openedBy: string | null
  openedCount: number | null
  status: Status
}

const links: Link[] = [
  { token: 'mn3kf2qa9j', target: 'Hospital Demo · 14 files',       created: '2d',  openedBy: 'Chuck', openedCount: 12, status: 'active' },
  { token: '9p41bx8s7t', target: 'IRB Review · 1 dataset',         created: '5d',  openedBy: 'Sarah', openedCount: 3,  status: 'active' },
  { token: 'xz73h1m4n5', target: 'Tribal Council · 1 collection',  created: '10d', openedBy: null,    openedCount: null, status: 'expiring' },
  { token: 'wz09pj7qr3', target: 'Genome Browser · 47 files',      created: '14d', openedBy: 'Mara',  openedCount: 1,  status: 'active' },
  { token: 'kp42mq8nb6', target: 'Plate 117 raw · 1 dataset',      created: '21d', openedBy: 'Aaron', openedCount: 4,  status: 'revoked' },
]

export function Sharing() {
  return (
    <div className="pane">
      <h1>Sharing</h1>
      <p className="lead">
        Magic links and access grants. Each row is a tokenised share.
        Who it points at, when it was made, who has opened it, whether it's still live.
      </p>
      <table className="data-table">
        <colgroup>
          <col style={{ width: '28px' }} />
          <col />
          <col style={{ width: '200px' }} />
          <col style={{ width: '80px' }} />
          <col style={{ width: '88px' }} />
        </colgroup>
        <thead>
          <tr>
            <th></th>
            <th>Target</th>
            <th>Opened by</th>
            <th>Created</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {links.map(l => (
            <tr key={l.token} data-status={l.status}>
              <td><span className="dot" /></td>
              <td><span className="text-primary">{l.target}</span></td>
              <td>
                {l.openedBy ? (
                  <>
                    {l.openedBy}{' '}
                    <span className="text-mono fg-muted tabular-nums">· {l.openedCount}×</span>
                  </>
                ) : null}
              </td>
              <td className="text-time">{l.created}</td>
              <td className="text-status text-right">{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
