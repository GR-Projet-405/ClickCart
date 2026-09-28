import React from 'react';
import { Route, Routes } from "react-router-dom";
import UIFoundationShowcase from "../App";
import CustomerLayout from "../layouts/CustomerLayout/CustomerLayout";
import CustomerWorkspace from "../pages/placeholders/CustomerWorkspace";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ServiceProviderLayout from "../layouts/ServiceProviderLayout/ServiceProviderLayout";
import WorkspacePlaceholder from "../pages/placeholders/WorkspacePlaceholder";
import NotFound from "../pages/placeholders/NotFound";
import { adminNavigation } from "../config/adminNavigation";
import { customerNavigation } from "../config/customerNavigation";
import { providerNavigation } from "../config/providerNavigation";

// Customer Payment & Checkout Feature (DEV-26 Shermi Weerasinghe)
import CheckoutPage from "../pages/checkout/CheckoutPage";
import PaymentResultPage from "../pages/checkout/PaymentResultPage";
import ReceiptPage from "../pages/checkout/ReceiptPage";
import PaymentHistoryPage from "../pages/customer/PaymentHistoryPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/dev/ui-foundation" element={<UIFoundationShowcase />} />
      <Route path="/provider" element={<ServiceProviderLayout />}>
        <Route
          index
          element={
            <WorkspacePlaceholder
              title="Service Provider Workspace"
              description="This area is reserved for service provider feature pages."
            />
          }
        />
        {providerNavigation.map(({ path }) => (
          <Route
            key={path}
            path={path.replace("/provider/", "")}
            element={
              <WorkspacePlaceholder
                title="Service Provider Workspace"
                description="This area is reserved for service provider feature pages."
              />
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route
          index
          element={
            <WorkspacePlaceholder
              title="Platform Admin Workspace"
              description="This area is reserved for platform admin feature pages."
            />
          }
        />
        {adminNavigation.map(({ path }) => (
          <Route
            key={path}
            path={path.replace("/admin/", "")}
            element={
              <WorkspacePlaceholder
                title="Platform Admin Workspace"
                description="This area is reserved for platform admin feature pages."
              />
            }
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<CustomerLayout />}>
        <Route index element={<CustomerWorkspace />} />

        {/* DEV-26 Feature Routes */}
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="checkout/result" element={<PaymentResultPage />} />
        <Route path="receipt/:id" element={<ReceiptPage />} />
        <Route path="customer/payments" element={<PaymentHistoryPage />} />

        {customerNavigation.slice(1).map(({ to }) => {
          // Skip routes that have explicit components registered above
          if (to === "/checkout" || to === "/customer/payments") return null;
          return <Route key={to} path={to.slice(1)} element={<CustomerWorkspace />} />;
        })}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
