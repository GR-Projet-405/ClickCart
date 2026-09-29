import React, { useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, Play, Plus, Trash2, UploadCloud } from "lucide-react";
import PageContainer from "../../../components/common/PageContainer";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import IconButton from "../../../components/common/IconButton";
import EmptyState from "../../../components/common/EmptyState";
import "./ServiceMedia.css";

// Swap this mock list for data from your services API once it's wired up.
const INITIAL_MEDIA = [
  { id: "m1", type: "image", url: null, isCover: true },
  { id: "m2", type: "image", url: null, isCover: false },
  { id: "m3", type: "video", url: null, isCover: false, duration: "0:32" },
  { id: "m4", type: "image", url: null, isCover: false },
  { id: "m5", type: "video", url: null, isCover: false, duration: "0:32" },
  { id: "m6", type: "image", url: null, isCover: false },
  { id: "m7", type: "image", url: null, isCover: false },
];

const TABS = [
  { key: "all", label: "All Media" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
];

export default function ServiceMedia() {
  const [media, setMedia] = useState(INITIAL_MEDIA);
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

  function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const newItems = files.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      type: file.type.startsWith("video") ? "video" : "image",
      url: URL.createObjectURL(file),
      isCover: false,
      duration: file.type.startsWith("video") ? "0:00" : undefined,
    }));

    setMedia((prev) => [...prev, ...newItems]);
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

  function handleDelete(id) {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  }

  function handleMakeCover(id) {
    setMedia((prev) =>
      prev.map((item) => ({ ...item, isCover: item.id === id }))
    );
  }

  function handleEdit(id) {
    const label = window.prompt("Set a caption / alt text for this media:");
    if (label === null) return;
    setMedia((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  }

  return (
    <PageContainer className="service-media">
      <header className="service-media__header">
        <div>
          <h1 className="cc-h1">Service Media &amp; Portfolio</h1>
          <p className="cc-body cc-text-secondary">
            Showcase your work with photos and videos so customers know what
            to expect.
          </p>
        </div>
        <Button leftIcon={<UploadCloud size={18} />} onClick={handleBrowseClick}>
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
        <Button variant="outline" onClick={handleBrowseClick}>
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
          Reorder, edit, or remove items. Your first photo appears as the
          cover.
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
                      <video src={item.url} muted />
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

                  {!item.isCover && (
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
              onClick={handleBrowseClick}
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
