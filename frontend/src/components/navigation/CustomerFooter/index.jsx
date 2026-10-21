import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "../../common/BrandLogo";
import PageContainer from "../../common/PageContainer";
import "./styles.css";
export default function CustomerFooter() {
 return <footer className="customer-footer"><PageContainer className="customer-footer__main">
 <Link to="/" aria-label="ClickCart home"><BrandLogo size="shell" showTagline /></Link>
 <nav className="customer-footer__links" aria-label="Footer navigation"><Link to="/find-services">Explore services</Link><Link to="/register" state={{role:"SERVICE_PROVIDER"}}>Become a provider</Link><Link to="/login">Sign in</Link><Link to="/admin/login">Administrator sign in</Link></nav>
 <p className="customer-footer__community">Made with <Heart size={16} fill="currentColor" /> for stronger communities</p>
 </PageContainer></footer>;
}
