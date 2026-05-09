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
  { token: 'mn3kf2qa9j', target: 'Hospital Demo · 14 files',          created: '2d',  openedBy: 'Chuck', openedCount: 12, status: 'active' },
  { token: '9p41bx8s7t', target: 'IRB Review · 1 dataset',            created: '5d',  openedBy: 'Sarah', openedCount: 3,  status: 'active' },
  { token: 'xz73h1m4n5', target: 'Tribal Council · 1 collection',    created: '10d', openedBy: null,    openedCount: null, status: 'expiring' },
  { token: 'wz09pj7qr3', target: 'Genome Browser · 47 files',         created: '14d', openedBy: 'Mara',  openedCount: 1,  status: 'active' },
  { token: 'kp42mq8nb6', target: 'Plate 117 raw · 1 dataset',         created: '21d', openedBy: 'Aaron', openedCount: 4,  status: 'revoked' },
]

export function Sharing() {
  return (
    <div className="pane">
      <h1 className="pane__title">Sharing</h1>
      <p className="pane__intro">
        Magic links and access grants. Each row is a tokenised share — who it points at, when
        it was made, who has opened it, and whether it's still live.
      </p>
      <table className="ledger">
        <thead>
          <tr>
            <th>Token</th>
            <th>Target</th>
            <th>Created</th>
            <th>Opened</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {links.map(l => (
            <tr key={l.token} data-status={l.status}>
              <td><span className="ledger__token">{l.token}</span></td>
              <td>{l.target}</td>
              <td><span className="ledger__time">{l.created}</span></td>
              <td>
                {l.openedBy ? (
                  <span className="ledger__opened">
                    {l.openedBy}{' '}
                    <span className="ledger__opened__count">· {l.openedCount}×</span>
                  </span>
                ) : (
                  <span className="ledger__time">—</span>
                )}
              </td>
              <td>
                <span className="ledger__status">
                  <span className="ledger__dot" />
                  <span>{l.status}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
