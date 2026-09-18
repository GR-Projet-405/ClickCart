# Service provider layout usage

Provider feature pages belong under the `/provider` route and render as children of `ServiceProviderLayout` in `frontend/src/routes/AppRoutes.jsx`.

Feature pages provide only their main content. Do not recreate `ProviderTopBar`, `ProviderHeader`, or `ProviderSidebar`; the layout supplies them automatically.

```jsx
<Route path="/provider" element={<ServiceProviderLayout />}>
  <Route path="example-area" element={<ExampleProviderPage />} />
</Route>
```

The existing sidebar paths temporarily reuse one neutral workspace placeholder. Assigned developers should replace or add child routes as features are implemented.
