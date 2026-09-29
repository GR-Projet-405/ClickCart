import React from "react";
import "../components.css";

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  children,
}) {
  const active = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className={`cc-tabs ${className}`.trim()}>
      <div className="cc-tabs__list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`cc-tabs__trigger ${tab.id === activeTab ? "cc-tabs__trigger--active" : ""}`.trim()}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`cc-tabs-panel-${tab.id}`}
            id={`cc-tabs-trigger-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.icon && (
              <span className="cc-tabs__trigger-icon" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="cc-tabs__panel"
        role="tabpanel"
        id={`cc-tabs-panel-${active?.id}`}
        aria-labelledby={`cc-tabs-trigger-${active?.id}`}
        tabIndex={0}
      >
        {typeof children === "function" ? children(active?.id) : children}
      </div>
    </div>
  );
}
