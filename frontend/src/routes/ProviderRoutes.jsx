import React from 'react';
import { Route, Routes } from "react-router-dom";
import { providerNavigation } from "../config/providerNavigation";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";
import NotFound from "../pages/placeholders/NotFound";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";

const providerRoutePages = [
  {
    path: "dashboard",
    title: "Provider Dashboard",
    description: "Your service business workspace at a glance.",
  },
  {
    path: "services",
    title: "My Services",
    description: "Manage the services you offer to customers.",
  },
  {
    path: "services/:serviceId/pricing",
    title: "Service Pricing",
    description: "Manage pricing for this service.",
  },
  {
    path: "services/:serviceId/media",
    title: "Service Media",
    description: "Manage photos and media for this service.",
  },
  {
    path: "bookings",
    title: "Bookings",
    description: "Review and manage customer bookings.",
  },
  {
    path: "service-areas",
    title: "Service Areas",
    description: "Choose the areas where you provide services.",
  },
  {
    path: "service-areas/new",
    title: "Add Service Area",
    description: "Add a new area to your service coverage.",
  },
  {
    path: "service-areas/:id/edit",
    title: "Edit Service Area",
    description: "Update the details of this service area.",
  },
  {
    path: "jobs",
    title: "Jobs",
    description: "View and manage your accepted jobs.",
  },
  {
    path: "jobs/:jobId",
    title: "Job Details",
    description: "Review the details and progress of this job.",
  },
  {
    path: "profile",
    title: "Provider Profile",
    description: "Manage the information customers see about your business.",
  },
  {
    path: "profile/setup",
    title: "Set Up Your Profile",
    description: "Complete the details needed to set up your provider profile.",
  },
  {
    path: "profile/edit",
    title: "Edit Provider Profile",
    description: "Update your provider profile information.",
  },
  {
    path: "profile/public",
    title: "Public Provider Profile",
    description: "Preview the profile customers can see.",
  },
  {
    path: "reviews",
    title: "Reviews",
    description: "Read feedback customers have shared about your services.",
  },
  {
    path: "availability",
    title: "Availability",
    description: "Manage when customers can book your services.",
  },
  {
    path: "settlements",
    title: "Settlements",
    description: "Review payouts and settlement activity.",
  },
  {
    path: "earnings",
    title: "Earnings",
    description: "Review your provider earnings.",
  },
  {
    path: "earnings/transactions",
    title: "Earnings Transactions",
    description: "Review individual earnings transactions.",
  },
  {
    path: "messages",
    title: "Messages",
    description: "Keep up with conversations with your customers.",
  },
  {
    path: "messages/conversations",
    title: "Conversations",
    description: "Browse your customer conversations.",
  },
  {
    path: "messages/:conversationId",
    title: "Conversation",
    description: "View and manage this customer conversation.",
  },
];

const explicitlyDefinedPaths = new Set(providerRoutePages.map(({ path }) => path));
const navigationPaths = providerNavigation
  .map(({ path }) => path.replace(/^\/provider\/?/, ""))
  .filter((path) => path && !explicitlyDefinedPaths.has(path));

function getNavigationPageTitle(path) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment.startsWith(":")
        ? "Details"
        : segment.charAt(0).toUpperCase() + segment.slice(1),
    )
    .join(" ");
}

function renderWorkspacePage(title, description) {
  return <WorkspacePlaceholder title={title} description={description} />;
}

export default function ProviderRoutes() {
  return (
    <Routes>
      <Route element={<ServiceProviderLayout />}>
        <Route
          index
          element={renderWorkspacePage(
            "Provider Dashboard",
            "Your service business workspace at a glance.",
          )}
        />
        {providerRoutePages.map(({ path, title, description }) => (
          <Route
            key={path}
            path={path}
            element={renderWorkspacePage(title, description)}
          />
        ))}
        {navigationPaths.map((path) => (
          <Route
            key={path}
            path={path}
            element={renderWorkspacePage(
              getNavigationPageTitle(path),
              `Manage your ${getNavigationPageTitle(path).toLowerCase()} from your provider workspace.`,
            )}
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
