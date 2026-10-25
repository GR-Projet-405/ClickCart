import { Link } from "react-router-dom";
import { useProvider } from "../../context/ProviderContext";
export default function ProviderSettings() {
 const { displayName, user } = useProvider();
 return <section className="notification-center"><header className="notification-center__header"><div><h1>Account settings</h1><p>{displayName} · {user.email}</p></div></header><div className="notification-center__card"><h2>Manage your account</h2><p><Link to="/provider/profile/edit">Edit profile and business details</Link></p><p><Link to="/provider/verification">Identity and business verification</Link></p><p><Link to="/provider/notifications">Notification preferences</Link></p><p><Link to="/provider/availability">Working hours and blocked dates</Link></p><p><Link to="/provider/service-areas">Service areas</Link></p></div></section>;
}
