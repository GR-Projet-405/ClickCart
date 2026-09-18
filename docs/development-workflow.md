# ClickCart development workflow

## Branch model

```text
main
└── dev
    └── feature branches
```

Use feature branch names such as `feature/DEV-XX-short-feature-name`.

Illustrative examples:

- `feature/DEV-09-service-areas`
- `feature/DEV-16-booking-creation`

## Recommended workflow

1. Pull the latest `dev` branch.
2. Create a feature branch.
3. Implement only the assigned feature.
4. Test locally.
5. Commit with a clear message.
6. Push the feature branch.
7. Open a pull request into `dev`.
8. Address review feedback.
9. Merge only after approval and successful checks.

Developers must not push directly to `main`, overwrite another member's feature, independently redesign shared layouts, commit `.env` secrets, or merge a broken build.

## Shared high-conflict files

Coordinate with team leadership before changing:

- `frontend/src/routes/AppRoutes.jsx`
- design tokens
- shared components
- `CustomerLayout`
- `ServiceProviderLayout`
- `AdminLayout`
- navigation configuration files
- `backend/src/main/resources/application.yml`
- `backend/pom.xml`
- `frontend/package.json`

Avoid unrelated formatting or cleanup in these files while working on a feature. Small, focused pull requests reduce merge conflicts.
