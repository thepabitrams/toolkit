# Core (`core`)

The absolute foundation of the application.
**Golden Rule:** `core` imports from *nothing* (except external libraries). It does not know the other layers exist.

## Folders
- **`components/`**: Atomic "dumb" UI primitives (Button, Card, Input). No business logic.
- **`services/`**: Raw browser API wrappers (OPFS, IndexedDB). No React allowed.
- **`hooks/`**: Global React hooks (e.g., `useMobile`).
- **`seo/`**: Astro-specific meta tags and SEO components.