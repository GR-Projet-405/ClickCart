// DEV-07: Service Pricing & Packages - Enhanced UI matching Provider Services design system
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  DollarSign, Clock, Package, Check, Plus, Trash2, 
  AlertCircle, ChevronRight, ArrowLeft, LoaderCircle, X, Pencil 
} from "lucide-react";
import { pricingService } from "../../services/pricingService";
import "./pricing-setup.css";

const PRICING_MODELS = [
  { id: "FIXED", label: "Fixed Price", desc: "Charge a set amount for the service", icon: DollarSign },
  { id: "STARTING", label: "Starting From", desc: "Set a minimum base price", icon: DollarSign },
  { id: "HOURLY", label: "Hourly Rate", desc: "Charge by the hour", icon: Clock },
  { id: "QUOTE", label: "Request a Quote", desc: "Customers request a custom price", icon: Package },
];

const EMPTY_PACKAGE_FORM = { packageName: "", description: "", price: "", durationMinutes: "60" };

export default function PricingSetupPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [pricingModel, setPricingModel] = useState("FIXED");
  const [basePrice, setBasePrice] = useState("");
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Package Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [packageForm, setPackageForm] = useState(EMPTY_PACKAGE_FORM);
  const [packageError, setPackageError] = useState("");

  useEffect(() => {
    loadData();
  }, [serviceId]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pricingRes, packagesRes] = await Promise.all([
        pricingService.getPricing(serviceId).catch(() => null),
        pricingService.getPackages(serviceId).catch(() => []),
      ]);

      if (pricingRes) {
        setPricingModel(pricingRes.pricingModel || "FIXED");
        setBasePrice(pricingRes.basePrice || "");
      }
      if (packagesRes) setPackages(packagesRes);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setIsLoading(true);
    try {
      await pricingService.savePricing(serviceId, {
        pricingModel,
        basePrice: basePrice ? parseFloat(basePrice) : null,
      });
      setSuccess("✓ Pricing configuration saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save pricing.");
    } finally {
      setIsLoading(false);
    }
  };

  const openPackageModal = (pkg = null) => {
    setPackageError("");
    if (pkg) {
      setEditingPackageId(pkg.id);
      setPackageForm({
        packageName: pkg.packageName,
        description: pkg.description || "",
        price: pkg.price.toString(),
        durationMinutes: pkg.durationMinutes.toString(),
      });
    } else {
      setEditingPackageId(null);
      setPackageForm(EMPTY_PACKAGE_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setPackageError("");
    if (!packageForm.packageName || !packageForm.price) {
      setPackageError("Package name and price are required.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        packageName: packageForm.packageName,
        description: packageForm.description,
        price: parseFloat(packageForm.price),
        durationMinutes: parseInt(packageForm.durationMinutes) || 60,
      };

      if (editingPackageId) {
        await pricingService.updatePackage(serviceId, editingPackageId, payload);
        setPackages(packages.map(p => p.id === editingPackageId ? { ...p, ...payload } : p));
        setSuccess("✓ Package updated successfully.");
      } else {
        const newPkg = await pricingService.createPackage(serviceId, payload);
        setPackages([...packages, newPkg]);
        setSuccess("✓ Package added successfully.");
      }
      setIsModalOpen(false);
    } catch (err) {
      setPackageError(err.message || "Failed to save package.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    setIsLoading(true);
    try {
      await pricingService.deletePackage(serviceId, pkgId);
      setPackages(packages.filter(p => p.id !== pkgId));
      setSuccess("✓ Package deleted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="pricing-setup-page">
      <div className="pricing-setup-container">
        {/* Breadcrumb */}
        <nav className="provider-services-breadcrumb" aria-label="Breadcrumb">
          <button className="breadcrumb-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Back
          </button>
          <ChevronRight size={14} />
          <span>Dashboard</span>
          <ChevronRight size={14} />
          <button className="breadcrumb-link" onClick={() => navigate("/provider/services")}>My Services</button>
          <ChevronRight size={14} />
          <strong>Pricing & Packages</strong>
        </nav>

        {/* Header */}
        <header className="provider-services-heading">
          <div>
            <span className="provider-service-eyebrow">SERVICE CONFIGURATION</span>
            <h1>Service Pricing & Packages</h1>
            <p>Configure how customers are charged for this service and create tiered packages.</p>
          </div>
        </header>

        {/* Alerts */}
        {error && (
          <div className="provider-service-alert" role="alert" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={17} /> {error}
            <button type="button" onClick={() => setError("")} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}><X size={15} /></button>
          </div>
        )}
        {success && (
          <div className="provider-service-toast" role="status" style={{ position: 'relative', top: 0, right: 0, marginBottom: '1.5rem' }}>
            <Check size={17} /> {success}
            <button type="button" onClick={() => setSuccess("")} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}><X size={15} /></button>
          </div>
        )}

        {/* Pricing Model Section */}
        <div className="pricing-section-card">
          <div className="pricing-section-header">
            <div>
              <h2 className="pricing-section-title">Pricing Model</h2>
              <p className="pricing-section-subtitle">Choose one model. It decides what customers see on your listing.</p>
            </div>
          </div>

          <div className="pricing-models-grid">
            {PRICING_MODELS.map((model) => {
              const Icon = model.icon;
              const isSelected = pricingModel === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setPricingModel(model.id)}
                  className={`pricing-model-card ${isSelected ? "pricing-model-card--selected" : ""}`}
                >
                  <div className="pricing-model-card__icon">
                    <Icon size={22} />
                  </div>
                  <h3 className="pricing-model-card__title">{model.label}</h3>
                  <p className="pricing-model-card__desc">{model.desc}</p>
                  {isSelected && <Check size={18} className="pricing-model-card__check" />}
                </button>
              );
            })}
          </div>

          {pricingModel !== "QUOTE" && (
            <div className="pricing-input-wrapper">
              <label className="provider-service-field" style={{ width: '100%', maxWidth: '400px' }}>
                {pricingModel === "HOURLY" ? "Rate per Hour (LKR)" : "Base Price (LKR)"} <span>*</span>
                <input 
                  type="number" 
                  min="0" 
                  step="100" 
                  value={basePrice} 
                  onChange={(e) => setBasePrice(e.target.value)} 
                  placeholder="0.00" 
                  required 
                />
              </label>
            </div>
          )}

          <div className="provider-service-modal__footer" style={{ borderTop: '1px solid #f2f4f7', marginTop: '2rem', paddingTop: '1.5rem' }}>
            <button className="provider-service-button provider-service-button--quiet" type="button" onClick={() => navigate(-1)}>Cancel</button>
            <button className="provider-service-button provider-service-button--primary" type="button" onClick={handleSavePricing} disabled={isLoading}>
              {isLoading ? <><LoaderCircle className="provider-service-spin" size={17} /> Saving...</> : <><Check size={16} /> Save Pricing Configuration</>}
            </button>
          </div>
        </div>

        {/* Packages Section */}
        <div className="pricing-section-card">
          <div className="pricing-section-header">
            <div>
              <h2 className="pricing-section-title">Service Packages</h2>
              <p className="pricing-section-subtitle">Create different packages to give customers more choices.</p>
            </div>
            <button className="provider-service-button provider-service-button--primary" type="button" onClick={() => openPackageModal()}>
              <Plus size={17} /> Add Package
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="provider-services-empty" style={{ minHeight: '15rem' }}>
              <div className="provider-services-empty__icon"><Package size={29} /></div>
              <h2>No packages yet</h2>
              <p>Create tiered pricing packages (Basic, Standard, Premium) to offer more options to your customers.</p>
              <button className="provider-service-button provider-service-button--primary" type="button" onClick={() => openPackageModal()}>
                <Plus size={17} /> Create Your First Package
              </button>
            </div>
          ) : (
            <div className="packages-list">
              {packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <div className="package-card__icon">
                    <Package size={20} />
                  </div>
                  <div className="package-card__body">
                    <h3 className="package-card__title">{pkg.packageName}</h3>
                    <p className="package-card__desc">{pkg.description || "No description provided."}</p>
                    <div className="package-card__meta">
                      <span className="package-card__price">LKR {pkg.price.toLocaleString()}</span>
                      <span className="package-card__duration"><Clock size={14} /> {pkg.durationMinutes} mins</span>
                    </div>
                  </div>
                  <div className="package-card__actions">
                    <button className="provider-service-icon-button" type="button" onClick={() => openPackageModal(pkg)} title="Edit package">
                      <Pencil size={16} />
                    </button>
                    <button className="provider-service-icon-button" type="button" onClick={() => handleDeletePackage(pkg.id)} title="Delete package" style={{ color: '#d92d20' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Package Modal */}
      {isModalOpen && (
        <div className="provider-service-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <section className="provider-service-modal provider-service-form" role="dialog" aria-modal="true">
            <header className="provider-service-modal__header">
              <div>
                <span className="provider-service-eyebrow">PACKAGE DETAILS</span>
                <h2 id="package-form-title">{editingPackageId ? "Edit package" : "Add a new package"}</h2>
                <p>Define the scope and price for this specific package tier.</p>
              </div>
              <button className="provider-service-icon-button" type="button" aria-label="Close" onClick={() => setIsModalOpen(false)}><X size={19} /></button>
            </header>
            <form onSubmit={handleSavePackage}>
              <div className="provider-service-form__body">
                {packageError && <p className="provider-service-alert" role="alert"><AlertCircle size={17} />{packageError}</p>}
                <label className="provider-service-field provider-service-field--full">
                  Package Name <span>*</span>
                  <input name="packageName" value={packageForm.packageName} onChange={(e) => setPackageForm({...packageForm, packageName: e.target.value})} maxLength={50} placeholder="e.g. Standard AC Service" required />
                </label>
                <label className="provider-service-field provider-service-field--full">
                  Description
                  <textarea name="description" value={packageForm.description} onChange={(e) => setPackageForm({...packageForm, description: e.target.value})} rows={3} maxLength={500} placeholder="Describe what is included in this package..." />
                </label>
                <label className="provider-service-field">
                  Price (LKR) <span>*</span>
                  <input type="number" min="0" step="100" name="price" value={packageForm.price} onChange={(e) => setPackageForm({...packageForm, price: e.target.value})} placeholder="2500" required />
                </label>
                <label className="provider-service-field">
                  Duration (Minutes)
                  <input type="number" min="1" name="durationMinutes" value={packageForm.durationMinutes} onChange={(e) => setPackageForm({...packageForm, durationMinutes: e.target.value})} placeholder="60" />
                </label>
              </div>
              <footer className="provider-service-modal__footer">
                <button className="provider-service-button provider-service-button--quiet" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="provider-service-button provider-service-button--primary" type="submit" disabled={isLoading}>
                  {isLoading ? <><LoaderCircle className="provider-service-spin" size={17} /> Saving...</> : <><Check size={16} /> {editingPackageId ? "Update Package" : "Create Package"}</>}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}