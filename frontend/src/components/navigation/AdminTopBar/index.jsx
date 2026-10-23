import { Link } from "react-router-dom";
import PageContainer from "../../common/PageContainer";
export default function AdminTopBar() { return <div className="dashboard-topbar"><PageContainer className="dashboard-topbar__inner"><span>ClickCart administration</span><nav className="dashboard-topbar__links" aria-label="Admin utility navigation"><Link to="/">Visit marketplace</Link><Link to="/admin/profile">My profile</Link></nav></PageContainer></div>; }
