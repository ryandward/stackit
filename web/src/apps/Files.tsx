import { File, Folder } from 'lucide-react'

const rows = [
  { name: 'IGVFFI0005HRPV.tsv',          kind: 'folder', size: '',         modified: '4 weeks ago' },
  { name: 'concertina-main',             kind: 'folder', size: '',         modified: '2 months ago' },
  { name: 'dataset_43560_datafiles.zip', kind: 'file',   size: '29.8 GB',  modified: 'Today, 8:51 AM' },
  { name: 'handoff.tar.gz',              kind: 'file',   size: '41.2 MB',  modified: 'Today, 7:44 AM' },
  { name: 'library.json',                kind: 'file',   size: '35.7 MB',  modified: '2 months ago' },
  { name: 'sacCer3.gbff',                kind: 'file',   size: '33.0 MB',  modified: '3 weeks ago' },
  { name: 'sacCer3.gtf',                 kind: 'file',   size: '13.0 MB',  modified: '3 weeks ago' },
] as const

export function Files() {
  return (
    <div className="pane">
      <h1>Files</h1>
      <p className="lead">
        Files in the demo tenant. Stub data. Wires to the server's files endpoint after schema lands.
      </p>
      <table className="data-table">
        <colgroup>
          <col style={{ width: '28px' }} />
          <col />
          <col style={{ width: '120px' }} />
          <col style={{ width: '180px' }} />
        </colgroup>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Size</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name}>
              <td>{r.kind === 'folder' ? <Folder /> : <File />}</td>
              <td><span className="text-primary text-mono">{r.name}</span></td>
              <td className="text-num">{r.size}</td>
              <td className="text-nowrap">{r.modified}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
