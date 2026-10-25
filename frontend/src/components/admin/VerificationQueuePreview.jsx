import { Link } from "react-router-dom";
import Spinner from "../common/Spinner";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import styles from "./VerificationQueuePreview.module.css";
export default function VerificationQueuePreview({loading,data}) {
 if(loading) return <Spinner label="Loading verification requests"/>;
 const rows = (data || []).filter(r=>r.status === "PENDING");
 return <div className={styles.wrapper}><p>{rows.length} pending verification requests</p>{!rows.length ? <p>No pending submissions.</p> : <ul className={styles.list}>{rows.slice(0,4).map(row=><li className={styles.row} key={row.id}><Avatar src={row.avatar} fallback={row.name.slice(0,2)} size="md"/><span className={styles.identity}><strong>{row.name}</strong><span>{row.category}</span></span><Badge variant="warning">Pending</Badge><Link to="/admin/providers">Review documents</Link></li>)}</ul>}</div>;
}
