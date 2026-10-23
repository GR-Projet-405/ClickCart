import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import BrandLogo from "../../common/BrandLogo";
import PageContainer from "../../common/PageContainer";
import "./styles.css";

export default function CustomerFooter() {
  const { user, status } = useAuth();
  return (
    <footer className="customer-footer">
      <PageContainer className="customer-footer__main">
        <Link to="/" aria-label="ClickCart home"><BrandLogo size="shell" showTagline /></Link>
        <nav className="customer-footer__links" aria-label="Footer navigation">
          <Link to="/find-services">Explore services</Link>
          {user?.role === "CUSTOMER" && <>
            <Link to="/my-bookings">My bookings</Link>
            <Link to="/messages">Messages</Link>
            <Link to="/customer/profile">My profile</Link>
          </>}
          {user?.role === "SERVICE_PROVIDER" && <>
            <Link to="/provider/dashboard">Provider dashboard</Link>
            <Link to="/provider/services">My services</Link>
          </>}
          {!user && status !== "loading" && <>
            <Link to="/register" state={{ role: "SERVICE_PROVIDER" }}>Become a provider</Link>
            <Link to="/login">Sign in</Link>
          </>}
        </nav>
        <p className="customer-footer__community">© {new Date().getFullYear()} ClickCart</p>
      </PageContainer>
    </footer>
  );
}
