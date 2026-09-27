export default function AuditLogTable({ entries = [] }) {
  return <div className="commission-table-wrap"><table className="commission-table"><thead><tr><th>Action</th><th>Actor</th><th>Rule</th><th>Timestamp</th></tr></thead><tbody>{entries.map((entry) => <tr key={`${entry.timestamp}-${entry.rule}`}><td><strong>{entry.action}</strong></td><td>{entry.actor}</td><td>{entry.rule}</td><td>{entry.timestamp}</td></tr>)}</tbody></table></div>;
}
