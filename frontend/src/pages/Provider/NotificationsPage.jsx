import { useEffect, useState } from "react";
import {
  fetchNotificationPreferences,
  fetchUnreadCount,
  saveNotificationPreferences,
} from "../../services/notificationService";
import "./NotificationsPage.css";

function enabledMap(groups) {
  const next = {};
  for (const group of groups || []) {
    for (const item of group.items || []) {
      next[item.type] = Boolean(item.enabled);
    }
  }
  return next;
}

function unreadLabel(count) {
  if (count === 1) return "You have 1 unread notification";
  return `You have ${count} unread notifications`;
}

export default function NotificationsPage() {
  const [groups, setGroups] = useState([]);
  const [enabled, setEnabled] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetchNotificationPreferences(), fetchUnreadCount()])
      .then(([preferences, unread]) => {
        if (!active) return;
        const nextGroups = preferences?.groups || [];
        setGroups(nextGroups);
        setEnabled(enabledMap(nextGroups));
        setUnreadCount(Number(unread?.count) || 0);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || "Could not load notifications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function toggle(type) {
    setStatus("");
    setEnabled((current) => ({ ...current, [type]: !current[type] }));
  }

  function disableAll() {
    setStatus("");
    setEnabled((current) =>
      Object.fromEntries(Object.keys(current).map((type) => [type, false]))
    );
  }

  async function savePreferences() {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const saved = await saveNotificationPreferences(enabled);
      const nextGroups = saved?.groups || groups;
      setGroups(nextGroups);
      setEnabled(enabledMap(nextGroups));
      setStatus("Preferences saved.");
    } catch (saveError) {
      setError(saveError.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="notification-center" aria-label="Notifications">
      <header className="notification-center__header">
        <div>
          <h1>Notification Center</h1>
          <p>{loading ? "Loading notifications" : unreadLabel(unreadCount)}</p>
        </div>
        <button
          type="button"
          className="notification-center__preferences"
          aria-pressed="true"
          onClick={() =>
            document.getElementById("notification-preferences")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
        >
          Preferences
        </button>
      </header>

      {error ? (
        <p className="notification-center__error" role="alert">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="notification-center__status" role="status">
          {status}
        </p>
      ) : null}

      <div className="notification-center__card" id="notification-preferences">
        <div className="notification-center__card-heading">
          <h2>Notification Preferences</h2>
          <p>Choose which notifications you want to receive in-app</p>
        </div>

        {loading ? <p className="notification-center__loading">Loading preferences</p> : null}

        {!loading &&
          groups.map((group) => (
            <section key={group.key} className="notification-center__group" aria-labelledby={`notification-group-${group.key}`}>
              <h3 id={`notification-group-${group.key}`}>{group.label}</h3>
              <ul>
                {(group.items || []).map((item) => (
                  <li key={item.type}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </div>
                    <button
                      type="button"
                      className="notification-center__switch"
                      role="switch"
                      aria-checked={Boolean(enabled[item.type])}
                      aria-label={item.title}
                      onClick={() => toggle(item.type)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}

        <div className="notification-center__actions">
          <button type="button" onClick={disableAll} disabled={loading || saving}>
            Disable All
          </button>
          <button type="button" onClick={savePreferences} disabled={loading || saving}>
            {saving ? "Saving" : "Save Preferences"}
          </button>
        </div>
      </div>
    </section>
  );
}
