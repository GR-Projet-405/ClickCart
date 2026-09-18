# ClickCart routing guide

Feature pages must be added as children of the correct shared layout in `frontend/src/routes/AppRoutes.jsx`. A feature page supplies only the content rendered inside the layout's `Outlet`.

## Customer pages

Customer pages use `CustomerLayout`. For example, a future `/bookings` page would be registered inside the customer route group:

```jsx
<Route element={<CustomerLayout />}>
  <Route path="bookings" element={<BookingsPage />} />
</Route>
```

## Service provider pages

Provider pages use the `/provider` namespace and `ServiceProviderLayout`:

```jsx
<Route path="/provider" element={<ServiceProviderLayout />}>
  <Route path="service-areas" element={<ServiceAreasPage />} />
</Route>
```

## Platform admin pages

Admin pages use the `/admin` namespace and `AdminLayout`:

```jsx
<Route path="/admin" element={<AdminLayout />}>
  <Route path="provider-verification" element={<ProviderVerificationPage />} />
</Route>
```

These examples are illustrative only; the pages are not part of the foundation.

Developers must not recreate shared headers, sidebars, top bars, or footers. Reuse the existing components and coordinate route names when separate features link to one another. Unknown paths intentionally render a not-found placeholder rather than silently displaying a workspace.
