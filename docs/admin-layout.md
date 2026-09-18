# Platform admin layout usage

Admin feature pages belong under the `/admin` route and render as children of `AdminLayout` in `frontend/src/routes/AppRoutes.jsx`.

Feature pages provide only their main content. Do not recreate `AdminTopBar`, `AdminHeader`, or `AdminSidebar`; the layout supplies them automatically.

```jsx
<Route path="/admin" element={<AdminLayout />}>
  <Route path="example-area" element={<ExampleAdminPage />} />
</Route>
```

The existing sidebar paths temporarily reuse one neutral workspace placeholder. Assigned developers should replace or add child routes as features are implemented.
