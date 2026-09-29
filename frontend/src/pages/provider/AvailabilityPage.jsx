import React, { useState } from "react";
import { CalendarDays, CalendarOff, Clock } from "lucide-react";
import PageContainer from "../../components/common/PageContainer";
import Tabs from "../../components/common/Tabs";
import WorkingHoursTab from "./WorkingHoursTab";
import BlockedDatesTab from "./BlockedDatesTab";
import AvailabilityCalendarTab from "./AvailabilityCalendarTab";

const TABS = [
  { id: "working-hours", label: "Working Hours", icon: <Clock size={16} /> },
  {
    id: "blocked-dates",
    label: "Blocked Dates",
    icon: <CalendarOff size={16} />,
  },
  { id: "calendar", label: "Calendar", icon: <CalendarDays size={16} /> },
];

function ComingSoon({ label }) {
  return (
    <p
      className="cc-body-sm cc-text-muted"
      style={{ margin: 0, padding: "var(--cc-space-6) 0", textAlign: "center" }}
    >
      {label} is coming soon.
    </p>
  );
}

export default function AvailabilityPage() {
  const [activeTab, setActiveTab] = useState("working-hours");

  return (
    <PageContainer>
      <div
        style={{
          display: "grid",
          gap: "var(--cc-space-5)",
          padding: "var(--cc-space-6) 0 var(--cc-space-10)",
        }}
      >
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
          {(id) => {
            if (id === "working-hours") return <WorkingHoursTab />;
            if (id === "blocked-dates") return <BlockedDatesTab />;
            if (id === "calendar") return <AvailabilityCalendarTab />;
            const tab = TABS.find((t) => t.id === id);
            return <ComingSoon label={tab ? tab.label : "This section"} />;
          }}
        </Tabs>
      </div>
    </PageContainer>
  );
}
