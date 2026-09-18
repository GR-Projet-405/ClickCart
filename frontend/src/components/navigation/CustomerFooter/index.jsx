import { Facebook, Instagram, Linkedin } from "lucide-react";
import BrandLogo from "../../common/BrandLogo";
import IconButton from "../../common/IconButton";
import PageContainer from "../../common/PageContainer";
import "./styles.css";

const footerLinks = [
  "About Us",
  "Terms & Conditions",
  "Privacy Policy",
  "Help Center",
  "Contact",
];
export default function CustomerFooter() {
  return (
    <footer className="customer-footer">
      <PageContainer className="customer-footer__main">
        <BrandLogo showTagline />
        <nav className="customer-footer__links" aria-label="Footer navigation">
          {footerLinks.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replaceAll(" ", "-").replace("&", "and")}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="customer-footer__social" aria-label="Social links">
          <IconButton
            icon={<Facebook size={17} />}
            label="Facebook"
            variant="ghost"
          />
          <IconButton
            icon={<Instagram size={17} />}
            label="Instagram"
            variant="ghost"
          />
          <IconButton
            icon={<Linkedin size={17} />}
            label="LinkedIn"
            variant="ghost"
          />
        </div>
      </PageContainer>
      <div className="customer-footer__bottom">
        <PageContainer>
          <small>
            © {new Date().getFullYear()} ClickCart. All rights reserved.
          </small>
        </PageContainer>
      </div>
    </footer>
  );
}
