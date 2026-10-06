import { useCallback, useEffect, useRef, useState } from "react";
import {
  Calendar,
  CheckCheck,
  Download,
  FileText,
  Image,
  Loader2,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck,
  User,
  X,
  Zap,
} from "lucide-react";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import PageContainer from "../../components/common/PageContainer";
import Spinner from "../../components/common/Spinner";
import {
  SAMPLE_BOOKING_DETAILS,
  SAMPLE_CONVERSATIONS,
  SAMPLE_EVENTS,
  SAMPLE_MESSAGES,
} from "../../config/messagesSampleData";
import {
  attachmentDownloadUrl,
  fetchBookingEvents,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendMessage,
  uploadAttachment,
} from "../../services/messagesService";
import "./messages.css";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

// DEV placeholder — in production these come from auth context/JWT
const CURRENT_USER = { customerId: "user-guest", providerId: "prov-hasith" };

// ── Utility helpers ───────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(contentType) {
  return contentType && contentType.startsWith("image/");
}

function getDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

function getInitials(name) {
  if (!name) return "??";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ConversationItem({ conv, active, onClick, userId }) {
  const amICustomer = conv.customerId === userId;
  const name = amICustomer ? conv.providerName : conv.customerName;
  const fallback = amICustomer ? conv.providerAvatarFallback : conv.customerAvatarFallback;
  const unread = amICustomer ? conv.unreadByCustomer : conv.unreadByProvider;
  const displayRole = amICustomer ? "Provider" : "Customer";

  return (
    <button
      className={`conv-item${active ? " conv-item--active" : ""}`}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      aria-label={`Conversation with ${name} about ${conv.serviceName}`}
    >
      <Avatar fallback={fallback || getInitials(name)} size="md" />
      <div className="conv-item__info">
        <div className="conv-item__row">
          <span className="conv-item__name">{name}</span>
          <span className="conv-item__time">{formatTime(conv.lastMessageAt)}</span>
        </div>
        <div className="conv-item__service">{conv.serviceCategory || conv.serviceName}</div>
        <div className="conv-item__booking-row">
          <span className="conv-item__booking-id">#{conv.bookingId}</span>
          <span style={{ fontSize: "0.7rem", color: "var(--cc-text-muted)" }}>
            {displayRole}
          </span>
          <Badge
            variant={conv.bookingStatus === "Confirmed" ? "success" : "neutral"}
            style={{ fontSize: "0.65rem", padding: "0 0.4rem", lineHeight: "1.2", marginLeft: "auto" }}
          >
            {conv.bookingStatus}
          </Badge>
        </div>
        <div className="conv-item__preview-row">
          <span className="conv-item__preview">{conv.lastMessagePreview || "No messages yet"}</span>
          {unread > 0 && (
            <span className="conv-item__unread" aria-label={`${unread} unread`}>
              {unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function SystemMessageBubble({ msg }) {
  const d = new Date(msg.createdAt);
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="msg-system" style={{ flexDirection: "column", alignItems: "center", gap: "4px", margin: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--cc-text-body-sm-size)", fontWeight: 600, color: "var(--cc-text-primary)" }}>
        <CheckCheck size={16} color="var(--cc-success)" />
        {msg.content}
      </div>
      <div style={{ fontSize: "var(--cc-text-caption-size)", color: "var(--cc-text-muted)" }}>
        {dateStr} · {timeStr}
      </div>
    </div>
  );
}

function AttachmentBubble({ att, isMine, messageId, userId, role }) {
  const isImg = isImageType(att.contentType);
  const downloadUrl = messageId
    ? attachmentDownloadUrl(messageId, userId, role)
    : "#";

  return (
    <div className={`msg-attachment${isMine ? " msg-attachment--mine" : ""}`}>
      <span className={`msg-attachment__icon${isImg ? " msg-attachment__icon--image" : ""}`}>
        {isImg ? <Image size={18} /> : <FileText size={18} />}
      </span>
      <div className="msg-attachment__info">
        <div className="msg-attachment__name">{att.originalFilename}</div>
        <div className="msg-attachment__meta">
          <span>{formatFileSize(att.sizeBytes)}</span>
          <span>·</span>
          <span>{isImg ? "Image" : "PDF"}</span>
        </div>
        <div className="msg-attachment__secure">
          <ShieldCheck size={11} />
          Secure attachment
        </div>
      </div>
      <a
        href={downloadUrl}
        className="msg-attachment__download"
        target="_blank"
        rel="noreferrer"
        download
        aria-label={`Download ${att.originalFilename}`}
      >
        <Download size={14} />
      </a>
    </div>
  );
}

function ChatBubble({ msg, isMine, userId, role }) {
  if (msg.type === "SYSTEM_EVENT") return <SystemMessageBubble msg={msg} />;

  const variant = isMine ? "mine" : "theirs";

  return (
    <div className={`msg-bubble-wrap msg-bubble-wrap--${isMine ? "mine" : "theirs"}`}>
      {!isMine && <Avatar fallback="??" size="sm" />}
      <div className={`msg-bubble msg-bubble--${variant}`}>
        {msg.type === "ATTACHMENT" && msg.attachment ? (
          <AttachmentBubble
            att={msg.attachment}
            isMine={isMine}
            messageId={msg.id}
            userId={userId}
            role={role}
          />
        ) : (
          <span>{msg.content}</span>
        )}
        <div className="msg-bubble__meta">
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          {isMine && <CheckCheck size={12} />}
        </div>
      </div>
    </div>
  );
}

// ── Attachment Composer ───────────────────────────────────────────────────────

const UPLOAD_STATE = {
  IDLE: "idle",
  SELECTED: "selected",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
};

function AttachmentComposer({ file, uploadState, uploadProgress, uploadError, onRemove }) {
  if (!file) return null;
  const isImg = isImageType(file.type);
  const previewUrl = isImg ? URL.createObjectURL(file) : null;

  return (
    <div className="chat-composer__preview">
      <span className={`chat-composer__preview-icon chat-composer__preview-icon--${isImg ? "image" : "pdf"}`}>
        {isImg && previewUrl
          ? <img src={previewUrl} alt="" />
          : <FileText size={18} />}
      </span>
      <div className="chat-composer__preview-info">
        <div className="chat-composer__preview-name">{file.name}</div>
        <div className="chat-composer__preview-meta">
          {formatFileSize(file.size)} · {isImg ? "Image" : "Document"}
        </div>
        {uploadState === UPLOAD_STATE.UPLOADING && (
          <>
            <div className="chat-composer__progress">
              <div
                className="chat-composer__progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="chat-composer__upload-status chat-composer__upload-status--uploading">
              <Loader2 size={11} style={{ animation: "cc-spin 700ms linear infinite" }} />
              Uploading... {uploadProgress}%
            </div>
          </>
        )}
        {uploadState === UPLOAD_STATE.ERROR && (
          <div className="chat-composer__upload-status chat-composer__upload-status--error">
            Upload failed — {uploadError || "please try again."}
          </div>
        )}
        {uploadState === UPLOAD_STATE.SUCCESS && (
          <div className="chat-composer__upload-status chat-composer__upload-status--success">
            <ShieldCheck size={11} /> Uploaded securely
          </div>
        )}
      </div>
      {uploadState !== UPLOAD_STATE.UPLOADING && (
        <button
          className="cc-icon-button cc-icon-button--ghost cc-icon-button--sm"
          onClick={onRemove}
          aria-label="Remove attachment"
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ── Booking Details Panel ─────────────────────────────────────────────────────

function BookingDetailsPanel({ conv, events }) {
  if (!conv) return null;

  // Merge sample booking details with conversation data
  const details = SAMPLE_BOOKING_DETAILS[conv.id] || {
    bookingId: conv.bookingId,
    serviceName: conv.serviceName,
    serviceCategory: conv.serviceCategory,
    bookingStatus: conv.bookingStatus,
    serviceDate: "—",
    serviceTime: "—",
    location: "—",
    customerName: conv.customerName,
    contact: "—",
  };

  return (
    <aside className="booking-details" aria-label="Booking details">
      <div className="booking-details__header">
        <h2>Booking Details</h2>
      </div>

      <div className="booking-details__service-card">
        <div className="booking-details__service-img">
          <FileText size={22} />
        </div>
        <div>
          <p className="booking-details__service-name">{details.serviceName}</p>
          <p className="booking-details__service-id">Booking #{details.bookingId}</p>
          <Badge variant="success" style={{ marginTop: "4px" }}>
            {details.bookingStatus}
          </Badge>
        </div>
      </div>

      <div className="booking-details__meta">
        <div className="booking-details__meta-row">
          <Calendar size={15} />
          <div>
            <p className="booking-details__meta-label">Service Date</p>
            <p className="booking-details__meta-value">
              {details.serviceDate}{details.serviceTime ? ` · ${details.serviceTime}` : ""}
            </p>
          </div>
        </div>
        <div className="booking-details__meta-row">
          <MapPin size={15} />
          <div>
            <p className="booking-details__meta-label">Location</p>
            <p className="booking-details__meta-value">{details.location}</p>
          </div>
        </div>
        <div className="booking-details__meta-row">
          <User size={15} />
          <div>
            <p className="booking-details__meta-label">Customer</p>
            <p className="booking-details__meta-value">{details.customerName}</p>
          </div>
        </div>
        {details.contact && (
          <div className="booking-details__meta-row">
            <Phone size={15} />
            <div>
              <p className="booking-details__meta-label">Contact</p>
              <p className="booking-details__meta-value">{details.contact}</p>
            </div>
          </div>
        )}
      </div>

      <div className="booking-details__cta">
        <Button variant="primary" style={{ width: "100%" }}>
          View Booking Details →
        </Button>
      </div>

      <div className="booking-timeline">
        <h3 className="booking-timeline__title">Booking Status Events</h3>
        <div className="booking-timeline__list">
          {(events || []).map((ev) => (
            <div
              key={ev.id}
              className={`booking-timeline__item booking-timeline__item--${ev.state}`}
            >
              <div className="booking-timeline__dot">
                {ev.state === "done" && <CheckCheck size={8} />}
              </div>
              <div className="booking-timeline__content">
                <p className="booking-timeline__label">{ev.label}</p>
                <p className="booking-timeline__time">
                  {ev.occurredAt
                    ? new Date(ev.occurredAt).toLocaleString([], {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Pending"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── Main MessagesPage ─────────────────────────────────────────────────────────

export default function MessagesPage({ role = "CUSTOMER" }) {
  const isProvider = role === "PROVIDER";
  const userId = isProvider ? CURRENT_USER.providerId : CURRENT_USER.customerId;

  // ── State ───────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState(null);
  const [msgLoading, setMsgLoading] = useState(false);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // Attachment state
  const [attachFile, setAttachFile] = useState(null);
  const [attachError, setAttachError] = useState(null);
  const [uploadState, setUploadState] = useState(UPLOAD_STATE.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const composerRef = useRef(null);

  // ── Load conversations ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setConvLoading(true);
      setConvError(null);
      try {
        const data = await fetchConversations(userId, role);
        setConversations(data && data.length ? data : SAMPLE_CONVERSATIONS);
      } catch {
        // Backend unavailable — fall back to sample data
        setConversations(SAMPLE_CONVERSATIONS);
      } finally {
        setConvLoading(false);
      }
    }
    load();
  }, [userId, role]);

  // ── Load messages when conversation changes ─────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    async function load() {
      setMsgLoading(true);
      try {
        const [msgs, evts] = await Promise.all([
          fetchMessages(activeConvId, userId, role),
          fetchBookingEvents(activeConvId, userId, role),
        ]);
        setMessages(msgs && msgs.length ? msgs : SAMPLE_MESSAGES[activeConvId] || []);
        setEvents(evts && evts.length ? evts : SAMPLE_EVENTS[activeConvId] || []);
        // Mark as read
        markConversationRead(activeConvId, userId, role).catch(() => {});
      } catch {
        setMessages(SAMPLE_MESSAGES[activeConvId] || []);
        setEvents(SAMPLE_EVENTS[activeConvId] || []);
      } finally {
        setMsgLoading(false);
      }
    }
    load();
  }, [activeConvId, userId, role]);

  // ── Auto-scroll to latest message ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Close attachment menu on outside click ──────────────────────────────────
  useEffect(() => {
    if (!attachMenuOpen) return;
    const handler = (e) => {
      if (composerRef.current && !composerRef.current.contains(e.target)) {
        setAttachMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [attachMenuOpen]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function selectFile(file) {
    setAttachError(null);
    setUploadState(UPLOAD_STATE.IDLE);
    setUploadProgress(0);

    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setAttachError(`File too large. Maximum is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      setAttachError("Unsupported file type. Use images, PDF, DOC, or TXT.");
      return;
    }
    setAttachFile(file);
    setUploadState(UPLOAD_STATE.SELECTED);
  }

  const handleFileInput = (e) => {
    selectFile(e.target.files?.[0] || null);
    e.target.value = "";
    setAttachMenuOpen(false);
  };

  const handleSend = useCallback(async () => {
    if (!activeConvId) return;

    // Send attachment
    if (attachFile && uploadState !== UPLOAD_STATE.UPLOADING) {
      setUploadState(UPLOAD_STATE.UPLOADING);
      setUploadProgress(0);
      try {
        const msg = await uploadAttachment(
          activeConvId,
          attachFile,
          userId,
          role,
          setUploadProgress
        );
        setMessages((prev) => [...prev, msg]);
        setAttachFile(null);
        setUploadState(UPLOAD_STATE.IDLE);
        setUploadProgress(0);
        return;
      } catch (err) {
        setUploadState(UPLOAD_STATE.ERROR);
        setAttachError(err.message || "Upload failed. Please try again.");
        return;
      }
    }

    // Send text message
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const msg = await sendMessage(
        { conversationId: activeConvId, content: trimmed, type: "TEXT" },
        userId,
        role
      );
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch {
      // Optimistic fallback for demo mode (no backend)
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          conversationId: activeConvId,
          senderId: userId,
          senderRole: role,
          type: "TEXT",
          content: trimmed,
          createdAt: new Date().toISOString(),
          readByCustomer: true,
          readByProvider: false,
        },
      ]);
      setText("");
    } finally {
      setSending(false);
    }
  }, [activeConvId, attachFile, text, uploadState, userId, role]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Conversation list filter ─────────────────────────────────────────────────
  const filteredConvs = conversations.filter((c) => {
    const amICustomer = c.customerId === userId;
    const name = amICustomer ? c.providerName : c.customerName;
    const matchesSearch =
      !search ||
      name?.toLowerCase().includes(search.toLowerCase()) ||
      c.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
      c.bookingId?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    
    const otherParticipantRole = amICustomer ? "providers" : "customers";
    
    if (tab === "customers" && otherParticipantRole !== "customers") return false;
    if (tab === "providers" && otherParticipantRole !== "providers") return false;
    
    return true;
  });

  const activeConv = filteredConvs.find((c) => c.id === activeConvId) || null;

  // ── Message date grouping ───────────────────────────────────────────────────
  function renderMessages() {
    if (msgLoading) {
      return (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <Spinner />
        </div>
      );
    }
    if (!messages.length) {
      return (
        <div className="chat-placeholder" style={{ flex: 1, background: "transparent" }}>
          <div className="chat-placeholder__content" style={{ boxShadow: "none", border: "none", background: "transparent" }}>
            <div className="chat-placeholder__icon" style={{ background: "transparent", color: "var(--cc-text-muted)" }}>
              <MessageSquare size={32} />
            </div>
            <p className="chat-placeholder__title" style={{ fontSize: "var(--cc-text-body-size)" }}>No messages yet</p>
            <p className="chat-placeholder__desc">
              Start the conversation by sending a message below.
            </p>
          </div>
        </div>
      );
    }

    const elements = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const dateLabel = getDateLabel(msg.createdAt);
      if (dateLabel !== lastDate) {
        lastDate = dateLabel;
        elements.push(
          <div key={`sep-${msg.id}`} className="chat-messages__date-separator">
            {dateLabel}
          </div>
        );
      }
      const isMine = msg.senderId === userId;
      elements.push(
        <ChatBubble key={msg.id} msg={msg} isMine={isMine} userId={userId} role={role} />
      );
    });
    return elements;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="messages-page">
      {/* Page hero */}
      <div className="messages-page__hero">
        <div className="messages-page__hero-icon">
          <MessageSquare size={18} />
        </div>
        <div>
          <h1>Messages</h1>
          <p>Stay connected with your {isProvider ? "customers" : "service providers"}.</p>
        </div>
      </div>

      <div className="messages-page__body">
        {/* ── LEFT: Conversation list ── */}
        <div className="conv-list">
          {/* Search */}
          <div className="conv-list__search">
            <div className="conv-list__search-wrap">
              <Search size={14} />
              <input
                className="conv-list__search-input"
                type="search"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search conversations"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="conv-list__tabs" role="tablist" aria-label="Filter conversations">
            {["all", "customers", "providers"].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`conv-list__tab${tab === t ? " conv-list__tab--active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="conv-list__items" role="list">
            {convLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <Spinner />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="messages-empty">
                <EmptyState
                  icon={<MessageSquare />}
                  title="No conversations"
                  description={search ? "No results match your search." : "No booking conversations yet."}
                />
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeConvId}
                  userId={userId}
                  onClick={() => setActiveConvId(conv.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── REST OF PAGE ── */}
        {!activeConv ? (
          <div className="chat-placeholder">
            <div className="chat-placeholder__content">
              <div className="chat-placeholder__icon">
                <MessageSquare size={32} strokeWidth={1.5} />
              </div>
              <h2 className="chat-placeholder__title">Select a booking conversation</h2>
              <p className="chat-placeholder__desc">
                Choose a booking conversation from the list to view messages, booking details and shared attachments.
              </p>
              <Button
                variant="primary"
                onClick={() => document.querySelector(".conv-list__search-input")?.focus()}
              >
                Start a Conversation
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ── CENTRE: Chat panel ── */}
            <div className="chat-panel">
              {/* Chat header */}
              <div className="chat-header">
                <Avatar
                  fallback={
                    (activeConv.customerId === userId
                      ? activeConv.providerAvatarFallback
                      : activeConv.customerAvatarFallback) || 
                    getInitials(activeConv.customerId === userId ? activeConv.providerName : activeConv.customerName)
                  }
                  size="md"
                  online
                />
                <div className="chat-header__identity">
                  <p className="chat-header__name">
                    {activeConv.customerId === userId ? activeConv.providerName : activeConv.customerName}
                  </p>
                  <div className="chat-header__status">
                    <span style={{ marginRight: "6px" }}>{activeConv.customerId === userId ? "Provider" : "Customer"}</span>
                    <span className="chat-header__status-dot" />
                    Online
                  </div>
                </div>

                {/* Booking chip */}
                <button className="chat-header__booking" type="button">
                  <div className="chat-header__booking-label">
                    <strong>{activeConv.serviceName}</strong>
                    <span>
                      Booking #{activeConv.bookingId} ·{" "}
                      <Badge variant="success" style={{ verticalAlign: "middle" }}>
                        {activeConv.bookingStatus}
                      </Badge>
                    </span>
                  </div>
                </button>

                <div className="chat-header__actions">
                  <button
                    className="cc-icon-button cc-icon-button--ghost cc-icon-button--md"
                    type="button"
                    aria-label="More options"
                  >
                    <Phone size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages" role="log" aria-live="polite">
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="chat-composer" ref={composerRef}>
                {/* Attachment preview */}
                <AttachmentComposer
                  file={attachFile}
                  uploadState={uploadState}
                  uploadProgress={uploadProgress}
                  uploadError={attachError}
                  onRemove={() => {
                    setAttachFile(null);
                    setUploadState(UPLOAD_STATE.IDLE);
                    setAttachError(null);
                    setUploadProgress(0);
                  }}
                />

                {/* Validation error (before file selected) */}
                {attachError && !attachFile && (
                  <div
                    style={{
                      padding: "var(--cc-space-2) var(--cc-space-4)",
                      fontSize: "var(--cc-text-caption-size)",
                      color: "var(--cc-error)",
                    }}
                  >
                    {attachError}
                  </div>
                )}

                <div className="chat-composer__row">
                  {/* Attachment button */}
                  <div className="chat-composer__actions" style={{ position: "relative" }}>
                    <button
                      id="attach-menu-btn"
                      className="cc-icon-button cc-icon-button--ghost cc-icon-button--md"
                      type="button"
                      aria-label="Add attachment"
                      aria-expanded={attachMenuOpen}
                      aria-haspopup="menu"
                      onClick={() => setAttachMenuOpen((o) => !o)}
                    >
                      <Paperclip size={18} />
                    </button>

                    {/* Attachment dropdown menu */}
                    {attachMenuOpen && (
                      <div className="attachment-menu" role="menu" aria-label="Attachment options">
                        <div className="attachment-menu__title">Add an attachment</div>
                        <button
                          className="attachment-menu__item"
                          role="menuitem"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <span className="attachment-menu__item-icon">
                            <Image size={16} />
                          </span>
                          Upload Photo
                        </button>
                        <button
                          className="attachment-menu__item"
                          role="menuitem"
                          onClick={() => docInputRef.current?.click()}
                        >
                          <span className="attachment-menu__item-icon">
                            <FileText size={16} />
                          </span>
                          Upload Document
                        </button>
                      </div>
                    )}

                    {/* Hidden file inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileInput}
                    />
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      style={{ display: "none" }}
                      onChange={handleFileInput}
                    />
                  </div>

                  {/* Text input */}
                  <div className="chat-composer__input-wrap">
                    <textarea
                      id="message-input"
                      className="chat-composer__input"
                      placeholder="Type a message..."
                      value={text}
                      rows={1}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      aria-label="Message input"
                      disabled={uploadState === UPLOAD_STATE.UPLOADING}
                    />
                  </div>

                  {/* Send button */}
                  <button
                    id="send-message-btn"
                    className="chat-composer__send"
                    type="button"
                    aria-label="Send message"
                    disabled={
                      sending ||
                      uploadState === UPLOAD_STATE.UPLOADING ||
                      (!text.trim() && !attachFile)
                    }
                    onClick={handleSend}
                  >
                    {sending || uploadState === UPLOAD_STATE.UPLOADING ? (
                      <Spinner size="sm" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
                <div style={{ textAlign: "center", paddingBottom: "var(--cc-space-2)", fontSize: "0.6875rem", color: "var(--cc-text-muted)" }}>
                  <ShieldCheck size={11} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  Attachments are shared securely within this booking.
                </div>
              </div>
            </div>

            {/* ── RIGHT: Booking details ── */}
            <BookingDetailsPanel conv={activeConv} events={events} />
          </>
        )}
      </div>
    </div>
  );
}
