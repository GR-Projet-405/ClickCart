# Customer layout usage

Customer-facing feature pages should be registered as child routes of `CustomerLayout` in `frontend/src/routes/AppRoutes.jsx`.

Each feature page supplies only its main content. Developers must not recreate `CustomerTopBar`, `CustomerHeader`, or `CustomerFooter`; `CustomerLayout` provides them automatically around the router outlet.

```jsx
<Route element={<CustomerLayout />}>
  <Route path="example" element={<ExampleCustomerPage />} />
</Route>
```

Use `PageContainer` inside a feature page for standard centered content. A page may omit it when a future design intentionally requires a full-width section.

The shared UI foundation showcase remains available at `/dev/ui-foundation` for development verification.
