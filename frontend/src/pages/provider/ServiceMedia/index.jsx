import { confirmAction, requestCaption } from "../../../context/FeedbackHost";
import { useParams } from "react-router-dom";
import { authFetch } from "../../../services/authService";
import { API_BASE_URL } from "../../../config/api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, Play, Plus, Trash2, UploadCloud } from "lucide-react";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";
import EmptyState from "../../../components/common/EmptyState";
import "./ServiceMedia.css";



const TABS = [
  { key: "all", label: "All Media" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
];

export default function ServiceMedia() {
  const { serviceId } = useParams();
  const [media, setMedia] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const endpoint = `${API_BASE_URL}/provider/services/${encodeURIComponent(serviceId)}/media`;
  async function request(path = "", options) {
    const response = await authFetch(`${endpoint}${path}`, options);
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "Unable to update service media. Please try again.");
    return data;
  }
  useEffect(() => {
    let active = true;
    setMedia([]); setBusy(true); setLoaded(false); setError("");
    request().then(data => { if (active) { setMedia(data); setLoaded(true); } })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [serviceId]);
  async function mutate(path, options) {
    if (busy || !loaded) return;
    setBusy(true); setError("");
    try { setMedia(await request(path, options)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const [activeTab, setActiveTab] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const counts = useMemo(
    () => ({
      all: media.length,
      image: media.filter((item) => item.type === "image").length,
      video: media.filter((item) => item.type === "video").length,
    }),
    [media]
  );

  const visibleMedia = useMemo(
    () =>
      activeTab === "all"
        ? media
        : media.filter((item) => item.type === activeTab),
    [media, activeTab]
  );

  async function addFiles(fileList) {
    if (busy || !loaded) return;
    setBusy(true); setError("");
    try {
      for (const file of Array.from(fileList || [])) {
        if (file.size > 10 * 1024 * 1024) throw new Error("Choose files up to 10 MB.");
        const body = new FormData(); body.append("file", file);
        setMedia(await request("", { method: "POST", body }));
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  function handleBrowseClick() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  async function handleDelete(id) {
    if (await confirmAction("Remove this file from your service?")) mutate(`/${id}`, { method: "DELETE" });
  }

  function handleMakeCover(id) {
    mutate(`/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isCover: true }) });
  }

  async function handleEdit(id) {
    const label = await requestCaption("Caption for this media:", media.find(item => item.id === id)?.label || "");
    if (label !== null) mutate(`/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) });
  }

  return (
    <PageContainer className="service-media">
      {error && <p role="alert" className="provider-data-error">{error}</p>}
      {busy && <p role="status">Saving or loading your media…</p>}
      <header className="service-media__header">
        <div>
          <h1 className="cc-h1">Service Media &amp; Portfolio</h1>
          <p className="cc-body cc-text-secondary">
            Showcase your work with photos and videos so customers know what
            to expect.
          </p>
        </div>
        <Button leftIcon={<UploadCloud size={18} />} onClick={handleBrowseClick} disabled={busy || !loaded}>
          Upload Media
        </Button>
      </header>

      <nav className="service-media__tabs" aria-label="Media filter">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`service-media__tab ${
              activeTab === tab.key ? "service-media__tab--active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </nav>

      <Card
        variant="soft-green"
        padding="none"
        className={`service-media__dropzone ${
          isDragging ? "service-media__dropzone--active" : ""
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className="service-media__dropzone-icon" aria-hidden="true">
          <UploadCloud size={22} />
        </span>
        <div className="service-media__dropzone-copy">
          <p className="cc-body" style={{ fontWeight: 600 }}>
            Drag &amp; drop images or videos here
          </p>
          <p className="cc-body-sm cc-text-secondary">
            or click to browse &bull; JPG, PNG, MP4 up to 50MB
          </p>
        </div>
        <Button variant="outline" onClick={handleBrowseClick} disabled={busy || !loaded}>
          Browse Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,video/mp4"
          multiple
          hidden
          onChange={handleFileInputChange}
        />
      </Card>

      <section className="service-media__portfolio">
        <h2 className="cc-h3">Your Portfolio</h2>
        <p className="cc-body-sm cc-text-secondary">
          Edit or remove your saved media, and choose an image for the service cover.
        </p>

        {visibleMedia.length === 0 ? (
          <EmptyState
            icon={<ImagePlus size={24} />}
            title="No media yet"
            description="Upload photos or videos to build out this section of your portfolio."
          />
        ) : (
          <div className="service-media__grid">
            {visibleMedia.map((item) => (
              <div className="service-media__tile" key={item.id}>
                <div className="service-media__thumb">
                  {item.url ? (
                    item.type === "video" ? (
                      <video src={item.url} controls preload="metadata" />
                    ) : (
                      <img src={item.url} alt={item.label || "Portfolio media"} />
                    )
                  ) : (
                    <div className="service-media__placeholder" />
                  )}

                  {item.isCover && (
                    <span className="service-media__cover-badge">
                      Cover Photo
                    </span>
                  )}

                  <div className="service-media__tile-actions">
                    <IconButton
                      icon={<Pencil size={14} />}
                      label="Edit media"
                      size="sm"
                      onClick={() => handleEdit(item.id)}
                    />
                    <IconButton
                      icon={<Trash2 size={14} />}
                      label="Remove media"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    />
                  </div>

                  {item.type === "video" && (
                    <span className="service-media__duration">
                      <Play size={10} fill="currentColor" /> {item.duration}
                    </span>
                  )}

                  {!item.isCover && item.type === "image" && (
                    <button
                      type="button"
                      className="service-media__make-cover"
                      onClick={() => handleMakeCover(item.id)}
                    >
                      Make cover
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="service-media__add-tile"
              onClick={handleBrowseClick} disabled={busy || !loaded}
            >
              <Plus size={22} />
              <span>Add Media</span>
            </button>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
