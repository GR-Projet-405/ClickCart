# MongoDB guidelines

- Use MongoDB consistently through Spring Data MongoDB.
- Collection names must follow one agreed naming convention.
- Keep ownership references clear and document whether a relationship is embedded or referenced.
- Add indexes intentionally for demonstrated query patterns; avoid speculative indexes.
- Avoid duplicated data unless denormalization has a documented consistency and performance justification.
- Use creation and update timestamps where appropriate.
- Never store secrets, tokens, or credentials as ordinary document fields.
- Validate external input at the API boundary before persistence.
- Coordinate shared models before changing fields used across features.

Exact collection naming, identifier strategy, auditing fields, shared document schemas, and cross-feature relationships are **TBD / Team Agreement Required**.

This guide does not define User, Booking, Payment, or any other marketplace schema.
