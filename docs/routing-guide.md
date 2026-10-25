# Application routing

`frontend/src/routes/AppRoutes.jsx` mounts the authentication screens and role-specific route groups.

- `CustomerRoutes.jsx`: public marketplace pages and customer account workflows, using `CustomerLayout`. Protected customer pages use `CustomerGuard`.
- `ProviderRoutes.jsx`: `/provider` workspace, using `ServiceProviderLayout` and `ProviderGuard`. Unapproved providers are directed to verification, with profile and settings available during onboarding.
- `AdminRoutes.jsx`: `/admin` workspace and `/commission_management`, using `AdminLayout` and administrator role checks.

Feature pages render inside their layout outlet and reuse shared navigation. Unknown routes render the not-found page. Current public entry points and workflow routes are listed in the main [README](../README.md#application-routes).

Frontend guards control navigation; backend authorization and ownership checks enforce data access.
