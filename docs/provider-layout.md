# Provider layout

`ServiceProviderLayout` supplies the shared navigation and page shell for provider pages. Feature content renders through the layout outlet.

Routes are defined in `frontend/src/routes/ProviderRoutes.jsx` and mounted by `AppRoutes.jsx`. Pages reuse the shared layout rather than rendering duplicate headers, sidebars or footers.

Account access follows the route guards. Provider work routes additionally require approved verification; profile, verification and account settings remain accessible during onboarding. Administrator authentication uses `/admin/login`.
