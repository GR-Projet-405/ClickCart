import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Eye,
  Grid2X2,
  ImagePlus,
  LayoutList,
  LoaderCircle,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Star,
  Wrench,
  X,
} from "lucide-react";
import { providerServicesApi } from "../../services/providerServices";
import { SERVICE_CATEGORIES } from "../../config/serviceCategories";
import "./provider-services.css";

const EMPTY_FORM = {
  title: "",
  category: SERVICE_CATEGORIES[0],
  description: "",
  priceFrom: "",
  priceTo: "",
  priceUnit: "per visit",
  imageUrl: "",
  status: "DRAFT",
};

const STATUS_FILTERS = ["All Statuses", "ACTIVE", "DRAFT", "PAUSED", "ARCHIVED"];

function formatPrice(value) {
  return new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatRange(service) {
  if (service.priceFrom == null || service.priceTo == null) return "Contact for pricing";
  const from = formatPrice(service.priceFrom);
  const to = formatPrice(service.priceTo);
  return from === to ? `LKR ${from}` : `LKR ${from} – ${to}`;
}

function statusLabel(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function categoryIcon(category) {
  if (category === "Electrical") return "⚡";
  if (category === "Plumbing") return "🚿";
  if (category === "IT & Electronics") return "⌘";
  if (category === "Cleaning") return "✦";
  return "🔧";
}

function ServiceArtwork({ service, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (service.imageUrl && !imageFailed) {
    return (
      <img
        className="provider-service-card__image"
        src={service.imageUrl}
        alt=""
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    );
  }
  return (
    <div className={`provider-service-artwork${compact ? " provider-service-artwork--compact" : ""}`} aria-hidden="true">
      <span>{categoryIcon(service.category)}</span>
      <Wrench size={compact ? 30 : 46} strokeWidth={1.3} />
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`provider-service-status provider-service-status--${status.toLowerCase()}`}>{statusLabel(status)}</span>;
}

function ListingMenu({ service, onEdit, onChangeStatus, onArchive }) {
  const closeMenu = (event) => {
    const details = event.currentTarget.closest("details");
    if (details) details.open = false;
  };
  return (
    <details className="provider-service-menu">
      <summary aria-label={`Actions for ${service.title}`} title="Service actions">
        <MoreHorizontal size={19} />
      </summary>
      <div className="provider-service-menu__panel">
        {service.status !== "ARCHIVED" && (
          <button type="button" onClick={(event) => { closeMenu(event); onEdit(service); }}>
            <Pencil size={15} /> Edit service
          </button>
        )}
        {service.status === "ACTIVE" ? (
          <button type="button" onClick={(event) => { closeMenu(event); onChangeStatus(service, "PAUSED"); }}>
            <Pause size={15} /> Pause service
          </button>
        ) : service.status === "ARCHIVED" ? (
          <button type="button" onClick={(event) => { closeMenu(event); onChangeStatus(service, "DRAFT"); }}>
            <RotateCcw size={15} /> Restore as draft
          </button>
        ) : (
          <button type="button" onClick={(event) => { closeMenu(event); onChangeStatus(service, "ACTIVE"); }}>
            <Play size={15} /> Publish service
          </button>
        )}
        {service.status !== "ARCHIVED" && (
          <button className="provider-service-menu__danger" type="button" onClick={(event) => { closeMenu(event); onArchive(service); }}>
            <Archive size={15} /> Archive service
          </button>
        )}
      </div>
    </details>
  );
}

function ServiceForm({ initial, isEditing, saving, error, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(initial || {}),
    priceFrom: initial?.priceFrom ?? "",
    priceTo: initial?.priceTo ?? "",
    status: initial?.status || "DRAFT",
  }));

  const setField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    if (Number(form.priceTo) < Number(form.priceFrom)) return;
    const values = {
      title: form.title,
      category: form.category,
      description: form.description,
      priceFrom: Number(form.priceFrom),
      priceTo: Number(form.priceTo),
      priceUnit: form.priceUnit,
      imageUrl: form.imageUrl,
    };
    if (!isEditing) values.status = form.status;
    onSave(values);
  };

  return (
    <div className="provider-service-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="provider-service-modal provider-service-form" role="dialog" aria-modal="true" aria-labelledby="service-form-title">
        <header className="provider-service-modal__header">
          <div>
            <span className="provider-service-eyebrow">SERVICE LISTING</span>
            <h2 id="service-form-title">{isEditing ? "Edit service" : "Add a new service"}</h2>
            <p>Share clear details so customers know what to expect.</p>
          </div>
          <button className="provider-service-icon-button" type="button" aria-label="Close" onClick={onClose}><X size={19} /></button>
        </header>
        <form onSubmit={submit}>
          <div className="provider-service-form__body">
            {error && <p className="provider-service-alert" role="alert"><CircleAlert size={17} />{error}</p>}
            <label className="provider-service-field provider-service-field--full">
              Service title <span>*</span>
              <input name="title" value={form.title} onChange={setField} maxLength={100} placeholder="e.g. AC repair and maintenance" required />
            </label>
            <label className="provider-service-field">
              Category <span>*</span>
              <select name="category" value={form.category} onChange={setField} required>
                {SERVICE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="provider-service-field">
              Listing status
              <select name="status" value={form.status} onChange={setField} disabled={isEditing}>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </select>
            </label>
            <label className="provider-service-field provider-service-field--full">
              Description <span>*</span>
              <textarea name="description" value={form.description} onChange={setField} rows={4} maxLength={2000} placeholder="Describe what is included in this service..." required />
              <small>{form.description.length}/2000 characters</small>
            </label>
            <div className="provider-service-field provider-service-field--full">
              <span className="provider-service-field__label">Price range (LKR) <span>*</span></span>
              <div className="provider-service-price-inputs">
                <label><span>From</span><input type="number" min="0" step="100" name="priceFrom" value={form.priceFrom} onChange={setField} placeholder="3000" required /></label>
                <label><span>To</span><input type="number" min="0" step="100" name="priceTo" value={form.priceTo} onChange={setField} placeholder="8000" required /></label>
                <label className="provider-service-price-inputs__unit"><span>Rate type</span><select name="priceUnit" value={form.priceUnit} onChange={setField}><option value="per visit">Per visit</option><option value="per hour">Per hour</option><option value="per day">Per day</option><option value="starting price">Starting price</option></select></label>
              </div>
              {Number(form.priceTo) < Number(form.priceFrom) && <small className="provider-service-field__error">The maximum price must be at least the minimum price.</small>}
            </div>
            <label className="provider-service-field provider-service-field--full">
              Photo URL <small>Optional</small>
              <div className="provider-service-input-with-icon"><ImagePlus size={17} /><input name="imageUrl" value={form.imageUrl || ""} onChange={setField} maxLength={2048} type="url" placeholder="https://example.com/service-photo.jpg" /></div>
            </label>
          </div>
          <footer className="provider-service-modal__footer">
            <button className="provider-service-button provider-service-button--quiet" type="button" onClick={onClose}>Cancel</button>
            <button className="provider-service-button provider-service-button--primary" type="submit" disabled={saving || Number(form.priceTo) < Number(form.priceFrom)}>
              {saving ? <LoaderCircle className="provider-service-spin" size={17} /> : <Check size={16} />}
              {saving ? "Saving..." : isEditing ? "Save changes" : "Save service"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function ServiceDetails({ service, onClose, onEdit }) {
  return (
    <div className="provider-service-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="provider-service-modal provider-service-details" role="dialog" aria-modal="true" aria-labelledby="service-details-title">
        <div className="provider-service-details__image"><ServiceArtwork service={service} /></div>
        <button className="provider-service-icon-button provider-service-details__close" type="button" aria-label="Close" onClick={onClose}><X size={19} /></button>
        <div className="provider-service-details__body">
          <div className="provider-service-details__heading"><StatusBadge status={service.status} /><span>{service.category}</span></div>
          <h2 id="service-details-title">{service.title}</h2>
          <p>{service.description}</p>
          <strong className="provider-service-details__price">{formatRange(service)} <small>{service.priceUnit}</small></strong>
          <button className="provider-service-button provider-service-button--primary" type="button" onClick={() => onEdit(service)}><Pencil size={16} />Edit service</button>
        </div>
      </section>
    </div>
  );
}

export default function ProviderServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [view, setView] = useState("grid");
  const [formState, setFormState] = useState(null);
  const [details, setDetails] = useState(null);
  const [toArchive, setToArchive] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [toastIsError, setToastIsError] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await providerServicesApi.list();
      setServices(Array.isArray(result) ? result : []);
    } catch (error) {
      setLoadError(error.message || "Services could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categories = useMemo(() => [...new Set(services.map((service) => service.category))].sort(), [services]);
  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return services.filter((service) => {
      const matchesText = !normalizedQuery || [service.title, service.category, service.description].some((value) => value?.toLowerCase().includes(normalizedQuery));
      const matchesStatus = statusFilter === "All Statuses" || service.status === statusFilter;
      const matchesCategory = categoryFilter === "All Categories" || service.category === categoryFilter;
      return matchesText && matchesStatus && matchesCategory;
    });
  }, [services, query, statusFilter, categoryFilter]);

  const saveListing = async (values) => {
    setSaving(true);
    setFormError("");
    try {
      const saved = formState.service
        ? await providerServicesApi.update(formState.service.id, values)
        : await providerServicesApi.create(values);
      setServices((current) => formState.service
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current]);
      setFormState(null);
      setDetails(null);
      setToastIsError(false);
      setToast(formState.service ? "Service updated successfully." : "Service created successfully.");
    } catch (error) {
      setFormError(error.message || "The service could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (service, status) => {
    setBusyId(service.id);
    try {
      const updated = await providerServicesApi.updateStatus(service.id, status);
      setServices((current) => current.map((item) => item.id === updated.id ? updated : item));
      setDetails((current) => current?.id === updated.id ? updated : current);
      setToastIsError(false);
      setToast(status === "ARCHIVED" ? "Service archived successfully." : `Service ${status === "ACTIVE" ? "published" : status === "PAUSED" ? "paused" : "restored"} successfully.`);
    } catch (error) {
      setToastIsError(true);
      setToast(error.message || "The service status could not be changed.");
    } finally {
      setBusyId("");
      setToArchive(null);
    }
  };

  const openCreate = () => { setFormError(""); setFormState({ service: null }); };
  const openEdit = (service) => { setDetails(null); setFormError(""); setFormState({ service }); };
  const noServices = !loading && !loadError && services.length === 0;

  return (
    <section className="provider-services-page">
      <div className="provider-services-container">
        <nav className="provider-services-breadcrumb" aria-label="Breadcrumb">
          <span>Dashboard</span><ChevronRight size={14} /><strong>My Services</strong>
        </nav>

        <header className="provider-services-heading">
          <div>
            <span className="provider-service-eyebrow">YOUR BUSINESS</span>
            <h1>My Services</h1>
            <p>Manage your service listings, keep them updated and reach more customers.</p>
          </div>
          <button className="provider-service-button provider-service-button--primary" type="button" onClick={openCreate}><Plus size={17} />Add New Service</button>
        </header>

        {toast && <div className={`provider-service-toast${toastIsError ? " provider-service-toast--error" : ""}`} role={toastIsError ? "alert" : "status"}>{toastIsError ? <CircleAlert size={17} /> : <Check size={17} />}{toast}<button type="button" aria-label="Dismiss notification" onClick={() => setToast("")}><X size={15} /></button></div>}

        <div className="provider-services-toolbar">
          <label className="provider-services-search"><Search size={17} /><input aria-label="Search your services" placeholder="Search your services..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="provider-services-filters">
            <label><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{STATUS_FILTERS.map((status) => <option key={status} value={status}>{status === "All Statuses" ? status : statusLabel(status)}</option>)}</select></label>
            <label><span className="sr-only">Filter by category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>All Categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          </div>
          <div className="provider-services-view-toggle" role="group" aria-label="Choose services view">
            <button className={view === "grid" ? "is-active" : ""} type="button" aria-label="Grid view" title="Grid view" onClick={() => setView("grid")}><Grid2X2 size={16} /></button>
            <button className={view === "list" ? "is-active" : ""} type="button" aria-label="List view" title="List view" onClick={() => setView("list")}><LayoutList size={17} /></button>
          </div>
        </div>

        <div className="provider-services-results-bar">
          <p>{loading ? "Loading your services…" : `Showing ${filteredServices.length} of ${services.length} ${services.length === 1 ? "service" : "services"}`}</p>
          <span><span className="provider-services-results-dot" />Synced with your listings</span>
        </div>

        {loadError ? (
          <div className="provider-services-message provider-services-message--error"><CircleAlert size={22} /><h2>Couldn’t load your services</h2><p>{loadError}</p><button className="provider-service-button provider-service-button--quiet" type="button" onClick={loadServices}>Try again</button></div>
        ) : loading ? (
          <div className="provider-services-loading" aria-label="Loading services"><LoaderCircle className="provider-service-spin" size={28} /></div>
        ) : noServices || filteredServices.length === 0 ? (
          <div className="provider-services-empty">
            <div className="provider-services-empty__icon"><Wrench size={29} /></div>
            <h2>{noServices ? "No services yet" : "No matching services"}</h2>
            <p>{noServices ? "Create your first service listing to start reaching local customers." : "Try changing your search or filters."}</p>
            {noServices && <button className="provider-service-button provider-service-button--primary" type="button" onClick={openCreate}><Plus size={17} />Add New Service</button>}
          </div>
        ) : view === "grid" ? (
          <div className="provider-services-grid">
            {filteredServices.map((service) => (
              <article className={`provider-service-card${busyId === service.id ? " provider-service-card--busy" : ""}`} key={service.id}>
                <div className="provider-service-card__media">
                  <ServiceArtwork service={service} />
                  <StatusBadge status={service.status} />
                  <ListingMenu service={service} onEdit={openEdit} onChangeStatus={changeStatus} onArchive={setToArchive} />
                </div>
                <div className="provider-service-card__body">
                  <div className="provider-service-card__category"><span>{categoryIcon(service.category)}</span>{service.category}</div>
                  <h2 title={service.title}>{service.title}</h2>
                  <p className="provider-service-card__description">{service.description}</p>
                  <strong className="provider-service-card__price">{formatRange(service)}<small>{service.priceUnit}</small></strong>
                  <div className="provider-service-card__meta">
                    <span><Star size={14} />No reviews yet</span>
                    <span><CalendarDays size={14} />{service.status === "ACTIVE" ? "Taking bookings" : service.status === "PAUSED" ? "Temporarily paused" : service.status === "ARCHIVED" ? "Archived listing" : "Not published"}</span>
                  </div>
                </div>
                <div className="provider-service-card__footer">
                  <button type="button" className="provider-service-button provider-service-button--quiet" onClick={() => setDetails(service)}><Eye size={15} />View</button>
                  <button type="button" className="provider-service-button provider-service-button--primary" onClick={() => openEdit(service)}><Pencil size={15} />Edit</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="provider-services-table-wrap">
            <table className="provider-services-table">
              <thead><tr><th>Service</th><th>Category</th><th>Price range</th><th>Status</th><th>Updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{filteredServices.map((service) => (
                <tr key={service.id}>
                  <td><button className="provider-services-table__title" type="button" onClick={() => setDetails(service)}><span className="provider-services-table__art"><ServiceArtwork service={service} compact /></span><strong>{service.title}</strong></button></td>
                  <td>{service.category}</td><td>{formatRange(service)} <small>{service.priceUnit}</small></td><td><StatusBadge status={service.status} /></td><td>{new Date(service.updatedAt).toLocaleDateString()}</td>
                  <td><button className="provider-service-icon-button" type="button" aria-label={`Edit ${service.title}`} onClick={() => openEdit(service)}><Pencil size={16} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {formState && <ServiceForm initial={formState.service} isEditing={Boolean(formState.service)} saving={saving} error={formError} onClose={() => !saving && setFormState(null)} onSave={saveListing} />}
      {details && <ServiceDetails service={details} onClose={() => setDetails(null)} onEdit={openEdit} />}
      {toArchive && (
        <div className="provider-service-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setToArchive(null)}>
          <section className="provider-service-confirm" role="alertdialog" aria-modal="true" aria-labelledby="archive-title">
            <div className="provider-service-confirm__icon"><Archive size={20} /></div>
            <h2 id="archive-title">Archive this service?</h2>
            <p><strong>{toArchive.title}</strong> will no longer be available to customers. You can restore it as a draft later.</p>
            <div><button className="provider-service-button provider-service-button--quiet" type="button" onClick={() => setToArchive(null)}>Cancel</button><button className="provider-service-button provider-service-button--danger" type="button" disabled={busyId === toArchive.id} onClick={() => changeStatus(toArchive, "ARCHIVED")}>{busyId === toArchive.id ? <LoaderCircle className="provider-service-spin" size={16} /> : <Archive size={16} />}Archive service</button></div>
          </section>
        </div>
      )}
    </section>
  );
}
