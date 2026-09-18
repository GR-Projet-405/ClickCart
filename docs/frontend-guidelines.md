# ClickCart frontend rules

1. Use the existing design tokens in `frontend/src/styles/tokens.css`.
2. Use `lucide-react` for icons.
3. Do not introduce a second icon library.
4. Do not introduce Bootstrap, Material UI, Ant Design, Tailwind, or another UI framework without team approval.
5. Reuse shared components before creating new ones.
6. Do not recreate shared headers, sidebars, top bars, or footers.
7. Feature pages must render inside the correct customer, provider, or admin layout.
8. Do not hardcode API base URLs.
9. Read the API base URL through `VITE_API_BASE_URL` using the shared config.
10. Do not commit secrets or real `.env` files.
11. Keep components reasonably small and focused.
12. Avoid giant page files; split meaningful sections when needed.
13. Use semantic HTML.
14. Preserve responsive behavior at the established breakpoints.
15. Follow the existing spacing, colors, radii, and typography.
16. Provide accessible labels, keyboard behavior, and visible focus states.
17. Do not make breaking changes to shared components without team coordination.

Feature-specific UI belongs with its assigned feature. Shared primitives should remain generic and must not contain marketplace business logic.
