import { ShoppingCart } from "lucide-react";
import "../components.css";
import "./styles.css";
export default function BrandLogo({
  size = "default",
  showTagline = false,
  className = "",
}) {
  return (
    <div className={`cc-brand-logo cc-brand-logo--${size} ${className}`.trim()}>
      <span className="cc-brand-logo__mark" aria-hidden="true">
        <ShoppingCart />
      </span>
      <span className="cc-brand-logo__copy">
        <span className="cc-brand-logo__name">
          Click<span>Cart</span>
        </span>
        {showTagline && (
          <span className="cc-brand-logo__tagline">
            Local Services, Just a Click Away
          </span>
        )}
      </span>
    </div>
  );
}
