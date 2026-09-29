export function formatLkr(value) {
  const amount = Number(value || 0);
  return `LKR ${amount.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
}

export function formatLkrCompact(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-LK", { maximumFractionDigits: 0 });
}

export function statusLabel(status) {
  switch (status) {
    case "PLACED":
      return "Placed";
    case "ACCEPTED":
      return "Accepted";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return status || "";
  }
}

export function paymentLabel(hold) {
  switch (hold) {
    case "ESCROW":
      return "Escrow Held";
    case "CASH_ON_DELIVERY":
      return "Cash on Delivery";
    case "PREAUTHORIZED":
      return "Pre-authorized Pay";
    default:
      return hold || "";
  }
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatWhen(iso, options) {
  if (!iso) {
    return "";
  }
  return new Intl.DateTimeFormat("en-LK", {
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(new Date(iso));
}

export function formatDateTime(iso) {
  if (!iso) {
    return "";
  }
  return new Intl.DateTimeFormat("en-LK", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function isSameDay(iso, date = new Date()) {
  if (!iso) {
    return false;
  }
  const value = new Date(iso);
  return (
    value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth() &&
    value.getDate() === date.getDate()
  );
}

export function isUpcoming(job) {
  return job.status === "PLACED" || job.status === "ACCEPTED";
}

export function isActive(job) {
  return job.status === "IN_PROGRESS";
}

export function elapsedLabel(startedAt) {
  if (!startedAt) {
    return "";
  }
  const minutes = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours <= 0) {
    return `${rest}m elapsed`;
  }
  return `${hours}h ${rest}m elapsed`;
}

export function durationClock(startedAt) {
  if (!startedAt) {
    return "00:00:00";
  }
  const total = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function mapsUrl(job) {
  if (job?.latitude && job?.longitude) {
    return `https://www.google.com/maps?q=${job.latitude},${job.longitude}`;
  }
  const query = encodeURIComponent([job?.address, job?.city].filter(Boolean).join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function osmEmbed(job) {
  const lat = Number(job?.latitude || 6.9271);
  const lng = Number(job?.longitude || 79.8612);
  const delta = 0.02;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta / 2}%2C${lng + delta}%2C${lat + delta / 2}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function weekRevenue(jobs) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const buckets = days.map((label) => ({ label, hvac: 0, electrical: 0 }));
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  jobs
    .filter((job) => job.status === "COMPLETED" && job.completedAt)
    .forEach((job) => {
      const completed = new Date(job.completedAt);
      if (completed < start) {
        return;
      }
      const index = (completed.getDay() + 6) % 7;
      const amount = Number(job.netPayout || 0);
      if (job.serviceCategory === "ELECTRICAL") {
        buckets[index].electrical += amount;
      } else {
        buckets[index].hvac += amount;
      }
    });
  const max = Math.max(1, ...buckets.map((item) => item.hvac + item.electrical));
  return buckets.map((item) => ({ ...item, max }));
}

export function fileSizeLabel(bytes) {
  const size = Number(bytes || 0);
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function lifecycleIndex(status) {
  if (status === "COMPLETED") return 4;
  if (status === "IN_PROGRESS") return 3;
  if (status === "ACCEPTED") return 2;
  return 1;
}
