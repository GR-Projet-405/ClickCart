import { Navigate, useLocation } from "react-router-dom";
import { useAuth, homePathForRole } from "./AuthContext";
export default function CustomerGuard({ children }) {
 const { user, status } = useAuth(); const location = useLocation();
 if (status === "loading") return <p role="status">Restoring your account…</p>;
 if (!user) return <Navigate to="/login" replace state={{from:location}} />;
 if (user.role !== "CUSTOMER") return <Navigate to={homePathForRole(user.role)} replace />;
 return children;
}
