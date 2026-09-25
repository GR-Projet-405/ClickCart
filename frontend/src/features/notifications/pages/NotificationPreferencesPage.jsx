import React, { useEffect, useState } from "react";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import PageContainer from "../../components/common/PageContainer";
import {
  getPreferences,
  updatePreferences,
} from "../notificationService";
import "./notifications.css";

import { Bell, BellOff, Mail, MessageSquare, Smartphone, ShieldCheck } from "lucide-react";

/**
 * Notification preferences page. Shows in-app as always-on and any stub
 * optional channel toggles as disabled with a "coming soon" note. No fake
 * functionality is wired up — optional channels are not implemented on the
 * backend yet (SUP-008).
 */
export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreferences();
      setPrefs(data);
    } catch (err) {
      setError(err.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(key, value) {
    if (!prefs) return;
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaving(true);
    setError(null);
    try {
      const body = { [key]: value, disabledEventTypes: prefs.disabledEventTypes };
      const updated = await updatePreferences(body);
      setPrefs(updated);
      setSavedAt(new Date());
    } catch (err) {
      setError(err.message || "Failed to save preferences");
      // revert on failure
      setPrefs((prev) => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="notification-page__empty">
          <Spinner size="lg" label="Loading preferences" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="notification-page__empty">
          <EmptyState
            icon={<BellOff size={32} aria-hidden="true" />}
            title="Could not load preferences"
            description={error}
            action={
              <button type="button" className="cc-button cc-button--primary" onClick={load}>
                Try again
              </button>
            }
          />
        </div>
      </PageContainer>
    );
  }

  if (!prefs) return null;

  return (
    <PageContainer>
      <div className="preferences-page">
        <h1 className="cc-h2">Notification Preferences</h1>
        <p className="cc-body-sm" style={{ margin: 0, color: "var(--cc-text-secondary)" }}>
          Choose how you receive notifications. In-app notifications are always on.
        </p>

        <div className="preferences-card">
          <div className="preferences-group">
            <h3 className="preferences-group__title cc-h4">In-app</h3>
            <p className="preferences-group__description">
              Notifications shown inside the ClickCart app. Always enabled.
            </p>
            <div className="preferences-toggle" aria-disabled="true">
              <div className="preferences-toggle__label">
                <strong>In-app notifications</strong>
                <span>Always on</span>
              </div>
              <input type="checkbox" checked disabled aria-label="In-app notifications" />
            </div>
          </div>

          <div className="preferences-group">
            <h3 className="preferences-group__title cc-h4">Email</h3>
            <p className="preferences-group__description">
              Receive notifications via email when in-app is unavailable.
            </p>
            <div className="preferences-toggle">
              <div className="preferences-toggle__label">
                <strong>Email notifications</strong>
                <span>Optional channel</span>
              </div>
              <input
                type="checkbox"
                checked={prefs.emailEnabled}
                aria-label="Email notifications"
                onChange={(e) => toggle("emailEnabled", e.target.checked)}
              />
            </div>
          </div>

          <div className="preferences-group">
            <h3 className="preferences-group__title cc-h4">SMS</h3>
            <p className="preferences-group__description">
              Receive notifications via SMS. Optional channel — not yet implemented.
            </p>
            <div className="preferences-toggle" aria-disabled="true">
              <div className="preferences-toggle__label">
                <strong>SMS notifications</strong>
                <span>Coming soon</span>
              </div>
              <input type="checkbox" checked={false} disabled aria-label="SMS notifications" />
            </div>
          </div>

          <div className="preferences-group">
            <h3 className="preferences-group__title cc-h4">WhatsApp</h3>
            <p className="preferences-group__description">
              Receive notifications via WhatsApp. Optional channel — not yet implemented.
            </p>
            <div className="preferences-toggle" aria-disabled="true">
              <div className="preferences-toggle__label">
                <strong>WhatsApp notifications</strong>
                <span>Coming soon</span>
              </div>
              <input type="checkbox" checked={false} disabled aria-label="WhatsApp notifications" />
            </div>
          </div>

          <div className="preferences-group">
            <h3 className="preferences-group__title cc-h4">Push</h3>
            <p className="preferences-group__description">
              Receive browser/app push notifications. Optional channel — not yet implemented.
            </p>
            <div className="preferences-toggle" aria-disabled="true">
              <div className="preferences-toggle__label">
                <strong>Push notifications</strong>
                <span>Coming soon</span>
              </div>
              <input type="checkbox" checked={false} disabled aria-label="Push notifications" />
            </div>
          </div>
        </div>

        <div className="preferences-coming-soon">
          Optional external channels (SMS, WhatsApp, push) are stubbed for now per
          SRS SUP-008. They will be implemented later without changing the core
          notification contract.
        </div>

        {savedAt && (
          <p className="cc-text-caption" style={{ marginTop: "var(--cc-space-3)", color: "var(--cc-success-text)" }}>
            Preferences saved at {savedAt.toLocaleTimeString()}.
          </p>
        )}
        {saving && <p className="cc-text-caption" style={{ marginTop: "var(--cc-space-3)", color: "var(--cc-text-muted)" }}>Saving...</p>}
      </div>
    </PageContainer>
  );
}