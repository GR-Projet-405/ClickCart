import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Calendar,
  User,
  MapPin,
  Clock,
  Tag,
  CheckCircle,
  AlertCircle,
  Zap,
  DollarSign
} from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import { paymentService } from "../../services/paymentService";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Booking details setup
  const bookingId = searchParams.get("bookingId") || "BKG-88421";
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [customerName, setCustomerName] = useState("Shermi Weerasinghe");
  const [customerEmail, setCustomerEmail] = useState("shermi.dev26@clickcart.com");
  const [customerPhone, setCustomerPhone] = useState("+94 77 123 4567");
  const [serviceAddress, setServiceAddress] = useState("No. 45, Main Street, Colombo 03");

  // Card states
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardHolder, setCardHolder] = useState("Shermi Weerasinghe");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");

  // Promo code
  const [promoCode, setPromoCode] = useState("CLICK10");
  const [promoApplied, setPromoApplied] = useState(true);
  const [discountPercent, setDiscountPercent] = useState(10);

  // Service base pricing
  const baseServicePrice = 150.0;
  const platformFee = 15.0;
  const taxAmount = 7.5;

  const discountAmount = promoApplied ? (baseServicePrice * discountPercent) / 100 : 0;
  const totalPayable = (baseServicePrice + platformFee + taxAmount - discountAmount).toFixed(2);

  const [paymentIntent, setPaymentIntent] = useState(null);

  useEffect(() => {
    // Initialize checkout payment intent
    const initIntent = async () => {
      setLoading(true);
      try {
        const intent = await paymentService.createPaymentIntent({
          bookingId,
          customerId: "CUST-101",
          providerId: "PROV-502",
          providerName: "Apex Premier HomeCare",
          serviceId: "SRV-901",
          serviceTitle: "Full Deep Cleaning & Sanitization Service",
          amount: parseFloat(totalPayable),
          currency: "USD",
          customerName,
          customerEmail,
          customerPhone,
          serviceAddress,
        });
        setPaymentIntent(intent);
      } catch (err) {
        console.error("Payment intent error:", err);
      } finally {
        setLoading(false);
      }
    };
    initIntent();
  }, [bookingId]);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "CLICK10" || promoCode.trim().toUpperCase() === "DISCOUNT10") {
      setPromoApplied(true);
      setDiscountPercent(10);
      setError(null);
    } else {
      setError("Invalid promo code. Try 'CLICK10' for 10% off.");
    }
  };

  const handleFormatCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === "CREDIT_CARD" || paymentMethod === "DEBIT_CARD") {
      if (!cardNumber || cardNumber.replace(/\s+/g, "").length < 15) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!expiry || !cvc) {
        setError("Please complete card expiry and CVC.");
        return;
      }
    }

    setProcessing(true);
    try {
      const result = await paymentService.processPayment({
        paymentId: paymentIntent?.id,
        bookingId: bookingId,
        paymentMethod: paymentMethod,
        cardNumber: cardNumber,
        cardExpiry: expiry,
        cardCvc: cvc,
        cardHolderName: cardHolder,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        serviceAddress: serviceAddress,
        promoCode: promoApplied ? promoCode : "",
      });

      // Navigate to Payment Result page
      navigate(`/checkout/result?paymentId=${result.id}&receiptNumber=${result.receiptNumber}&status=${result.status}`);
    } catch (err) {
      setError(err.message || "Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="cc-checkout-container">
      <div className="cc-checkout-header">
        <div className="cc-checkout-badge-row">
          <Badge variant="primary">DEV-26 Assigned Feature</Badge>
          <Badge variant="success"><ShieldCheck size={14} /> 256-Bit SSL Encrypted</Badge>
        </div>
        <h1 className="cc-checkout-title">Customer Payment & Checkout</h1>
        <p className="cc-checkout-subtitle">
          Review your scheduled booking details and choose your preferred payment method.
        </p>
      </div>

      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          color: "#991b1b",
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitPayment} className="cc-checkout-grid">
        {/* Left Main Column */}
        <div className="cc-checkout-main-col">
          {/* Section 1: Booking Details */}
          <div className="cc-checkout-card">
            <h2 className="cc-checkout-section-title">
              <Calendar className="cc-text-primary" size={20} /> Booking & Service Review
            </h2>
            <div className="cc-booking-summary-box">
              <div className="cc-summary-item">
                <div className="cc-summary-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="cc-summary-label">Service Title</div>
                  <div className="cc-summary-value">Deep Home Cleaning & Sanitization</div>
                </div>
              </div>
              <div className="cc-summary-item">
                <div className="cc-summary-icon">
                  <User size={18} />
                </div>
                <div>
                  <div className="cc-summary-label">Verified Provider</div>
                  <div className="cc-summary-value">Apex Premier HomeCare</div>
                </div>
              </div>
              <div className="cc-summary-item">
                <div className="cc-summary-icon">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="cc-summary-label">Scheduled Date & Time</div>
                  <div className="cc-summary-value">Oct 15, 2026 at 10:00 AM</div>
                </div>
              </div>
              <div className="cc-summary-item">
                <div className="cc-summary-icon">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="cc-summary-label">Booking Reference</div>
                  <div className="cc-summary-value">{bookingId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Service Location */}
          <div className="cc-checkout-card">
            <h2 className="cc-checkout-section-title">
              <User className="cc-text-primary" size={20} /> Customer Information
            </h2>
            <div className="cc-card-form" style={{ background: "transparent", border: "none", padding: 0 }}>
              <Input
                label="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
              <Input
                label="Service Location Address"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="cc-checkout-card">
            <h2 className="cc-checkout-section-title">
              <CreditCard className="cc-text-primary" size={20} /> Select Payment Method
            </h2>
            <div className="cc-payment-methods-grid">
              <button
                type="button"
                className={`cc-method-btn ${paymentMethod === "CREDIT_CARD" ? "active" : ""}`}
                onClick={() => setPaymentMethod("CREDIT_CARD")}
              >
                <CreditCard size={24} color={paymentMethod === "CREDIT_CARD" ? "#0284c7" : "#64748b"} />
                <span className="cc-method-name">Credit / Debit Card</span>
              </button>

              <button
                type="button"
                className={`cc-method-btn ${paymentMethod === "DEMO_GATEWAY" ? "active" : ""}`}
                onClick={() => setPaymentMethod("DEMO_GATEWAY")}
              >
                <Zap size={24} color={paymentMethod === "DEMO_GATEWAY" ? "#0284c7" : "#64748b"} />
                <span className="cc-method-name">Instant Gateway</span>
              </button>

              <button
                type="button"
                className={`cc-method-btn ${paymentMethod === "CASH_ON_SERVICE" ? "active" : ""}`}
                onClick={() => setPaymentMethod("CASH_ON_SERVICE")}
              >
                <DollarSign size={24} color={paymentMethod === "CASH_ON_SERVICE" ? "#0284c7" : "#64748b"} />
                <span className="cc-method-name">Cash on Service</span>
              </button>
            </div>

            {paymentMethod === "CREDIT_CARD" && (
              <div className="cc-card-form">
                <div className="cc-full-width">
                  <Input
                    label="Card Number"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleFormatCardNumber}
                    required
                  />
                </div>
                <div className="cc-full-width">
                  <Input
                    label="Cardholder Name"
                    placeholder="Shermi Weerasinghe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Expiry (MM/YY)"
                    placeholder="12/28"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="CVC / CVV"
                    placeholder="123"
                    type="password"
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === "DEMO_GATEWAY" && (
              <div style={{ background: "#f0f9ff", padding: "16px", borderRadius: "8px", border: "1px solid #bae6fd" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#0369a1" }}>
                  <strong>Demo Gateway Mode:</strong> Simulates real-time payment authorization and instantly verifies transactions with Spring Boot backend webhook hooks.
                </p>
              </div>
            )}

            {paymentMethod === "CASH_ON_SERVICE" && (
              <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#15803d" }}>
                  <strong>Cash Payment:</strong> Pay the provider directly in cash upon completion of your service. Your booking will be confirmed immediately.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Price Breakdown & Place Order */}
        <div className="cc-checkout-sidebar">
          <div className="cc-checkout-card cc-order-summary-card">
            <h2 className="cc-checkout-section-title">
              <Tag size={20} className="cc-text-primary" /> Payment Breakdown
            </h2>

            <div className="cc-summary-row">
              <span>Service Base Price</span>
              <span>${baseServicePrice.toFixed(2)}</span>
            </div>

            <div className="cc-summary-row">
              <span>Platform Service Fee (10%)</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>

            <div className="cc-summary-row">
              <span>Estimated Tax (5%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>

            {promoApplied && (
              <div className="cc-summary-row discount">
                <span>Promo Discount ({discountPercent}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="cc-promo-box">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleApplyPromo}>
                Apply
              </Button>
            </div>

            <div className="cc-summary-divider" />

            <div className="cc-summary-row total">
              <span>Total Amount</span>
              <span style={{ color: "#0284c7" }}>${totalPayable} USD</span>
            </div>

            <button
              type="submit"
              className="cc-pay-now-btn"
              disabled={processing || loading}
            >
              {processing ? (
                <>Verifying & Processing...</>
              ) : (
                <>
                  <Lock size={18} /> Pay ${totalPayable} & Confirm
                </>
              )}
            </button>

            <div className="cc-security-footer">
              <div className="cc-security-badge">
                <CheckCircle size={14} /> ClickCart Money Back Guarantee
              </div>
              <span>Transactions secured by Spring Boot Backend REST APIs & MongoDB Audit Trail.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
