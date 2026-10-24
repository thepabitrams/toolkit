<div align="center">

# ToolKit by Pabitra Mohan Singh

**A premium, privacy-first suite of local-processing web tools.**

[![Astro](https://img.shields.io/badge/Astro-7.x-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

[![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Better Auth](https://img.shields.io/badge/Better_Auth-000000?style=for-the-badge)](https://better-auth.com)
[![Zustand](https://img.shields.io/badge/Zustand-2C2C2C?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

</div>

## Overview

Toolkit is a modern, serverless web application built for speed and privacy. It features a collection of tools (like Precision Crop and AI-powered background removal) that process data entirely locally in the browser. It also includes a fully authenticated, edge-computed community discussion system.

## Features

- **Privacy-First Tooling:** All image processing, EXIF metadata extraction, and AI transformations happen locally on your device using Hugging Face Transformers and WebAssembly. No files are uploaded to a server.
- **Advanced Image Editing:** Native support for `react-easy-crop`, file dropping, and EXIF metadata reading/writing.
- **Edge-Ready Architecture:** Deployed on Cloudflare Workers for ultra-low latency globally.
- **Real-Time Comments:** A fully threaded, YouTube-style comment system with nested replies, animations, and Zustand state management.
- **Google Authentication:** Secure, passwordless login powered by Better Auth.
- **Serverless Database:** Cloudflare D1 (SQLite) integrated via Drizzle ORM.
- **FIFO Comment Limits:** Automated database cleanup keeping the latest 20 root comments per tool.

## Tech Stack

- **Framework:** [Astro](https://astro.build)
- **UI Library:** [React](https://react.dev)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Animations:** [Motion](https://motion.dev)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) + [Zundo](https://github.com/charkour/zundo) (Undo/Redo)
- **Machine Learning:** [Hugging Face Transformers](https://huggingface.co/docs/transformers.js/en/index) (Local Browser Inference)
- **Local Database:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via `idb`
- **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **Authentication:** [Better Auth](https://better-auth.com)
- **Package Manager:** [pnpm](https://pnpm.io)

## Architecture Overview

Toolkit is built on a modern, serverless hybrid architecture combining **Astro (for the shell, routing, and SEO)** with **React (for isolated, interactive islands)**. 

To support infinite scalability and "Plug & Play" tool addition, the codebase strictly adheres to a **Feature-Sliced Design** and a **Unidirectional Dependency Flow**.

### Top-Level Structure

```text
toolkit/
└── src/
    ├── config/       # Master Tool Registry & SEO
    ├── layouts/      # Astro Shell (BaseLayout, ToolLayout)
    ├── pages/        # Astro Routes
    ├── _pages/       # React Controllers (HomeView, ToolView)
    ├── tools/        # Plug & Play Zone (Isolated Features)
    ├── shared/       # Cross-Tool Domain Logic & UI
    └── core/         # System Engine (DB, Auth, APIs)
```

### Dependency Flow

```text
pages ➔ _pages ➔ tools ➔ shared ➔ core
```

- pages/ & layouts/: Only handle Astro routing and SEO.
- _pages/: The "Glue". React controllers that mount specific tools.
- tools/: The "Plug & Play" zone. Each tool is built in complete isolation.
- shared/: The Warehouse. If a component or hook is used by 2+ tools, it gets promoted here.
- core/: The Foundation. UI primitives, raw browser APIs, and Database configurations. core imports from NOTHING except third-party packages.

### Adding a New Tool (Plug & Play)

Because of the dynamic routing architecture, adding a new tool takes exactly 3 steps. You do not need to touch the router or layout.

#### Create the Tool Component

Create a new folder inside the appropriate category in src/tools/. For example, src/tools/media/image-compressor/.
Create your main React component inside (e.g., ImageCompressor.tsx). Export it as the default export.

#### Register the Tool
Open src/config/tools.ts and add the new tool to the master registry. This file handles the routing, SEO, and dynamic loading.
```typescript
export const toolsConfig = {
  // ... existing tools
  'image-compressor': {
    slug: 'image-compressor',
    displayName: 'Image Compressor',
    description: 'Compress images locally without losing quality.',
    seoTitle: 'Free Image Compressor - Toolkit',
    seoDescription: 'Compress JPG, PNG, and WebP images directly in your browser. 100% private.',
    category: 'media',
  },
};
```
#### Done.

That's it. The ToolView.tsx controller will automatically read the registry, dynamically import your component, and Astro will generate the page at /image-compressor.

### State & Data Management

- `Global State (Zustand)`: Handled inside `shared/store/`. We use a Normalized State Architecture for the fileStore. Files are stored in a flat dictionary and referenced by lightweight bucket indexes.
- `Backend State (Cloudflare D1)`: Server-side data (like comments) uses Drizzle ORM and Cloudflare D1. The React frontend interacts with D1 via standard REST API calls (`/api/comments`).
- `Local State (useState)`: Purely for UI toggles (e.g., `isDrawerOpen`, `draftCommentText`). We never put UI state inside Zustand.

### Authentication & Security

- `Better Auth`: Handles secure, HTTP-only session cookies.
- `Middleware`: Astro's `src/middleware.ts` intercepts every request, verifies the session, and attaches the `user` object to `Astro.locals`.
- `FIFO Database Limits`: The backend API strictly enforces a limit (e.g., 20 root comments per tool) to prevent database bloat, automatically deleting the oldest comments and their children.

## Getting Started

### Prerequisites

- Node.js (v22.22.0+)
- pnpm (v9+)
- A Cloudflare account
- A Google Cloud Console account (for OAuth)

### Installation

Clone the repository:
```bash
git clone https://github.com/thepabitrams/toolkit.git
cd toolkit
```
   
Install dependencies:
```bash
pnpm install
```

Set up environment variables. Create a `.dev.vars` file in the root for local development:
```ini
BETTER_AUTH_SECRET="your-random-secret"
BETTER_AUTH_URL="http://localhost:4321"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Setup the local database:
```bash
pnpm exec wrangler d1 migrations apply toolkit-db --local
```

Start the development server:
```bash
pnpm dev
```

## Deployment

Push database migrations to production:
```bash
pnpm exec wrangler d1 migrations apply toolkit-db --remote
```

Deploy the worker:
```bash
pnpm run build
pnpm exec wrangler deploy
```

Production deployment is automated via Cloudflare Workers Builds.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `pnpm run build` |
| Deploy command | `pnpm exec wrangler deploy` |
| Preview command | `pnpm exec wrangler versions upload` |

Push to `main` triggers a production deploy to `https://toolkit.pabitramohansingh.com`. Pushes to any other branch create preview versions.

### Cloudflare Bindings

Configured in `wrangler.jsonc`:

- DB – D1 database (toolkit-db)
- SESSION – KV namespace (auto-provisioned)
- AI – Workers AI binding
- IMAGES – Cloudflare Images binding
- ASSETS – Static asset binding

## Folder Structure

```text
src/
├── config/                 # Master Tool Registry & SEO (tools.ts, site.ts)
├── core/                   # System Engine (DB, Auth, UI Primitives, APIs)
├── _pages/                 # React Controllers (HomeView, ToolView)
├── layouts/                # Astro Shell (BaseLayout, ToolLayout)
├── pages/                  # Astro Routes (index.astro, [slug].astro)
├── shared/                 # Cross-Tool Domain Logic & UI (Zustand, hooks)
├── styles/                 # Global Tailwind CSS
├── tools/                  # Plug & Play Zone (Isolated Features)
├── env.d.ts                # Environment & Cloudflare types
└── middleware.ts           # Auth Session Interceptor

.dev.vars                   # Local backend secrets (ignored by Git)
.env                        # Build-time frontend URLs (ignored by Git)
.gitignore                  # Git ignore rules
astro.config.mjs            # Astro & Cloudflare configuration
drizzle.config.ts           # Drizzle ORM configuration
package.json                # Project manifest
pnpm-lock.yaml              # Dependency lockfile
pnpm-workspace.yaml         # pnpm workspace config
tsconfig.json               # TypeScript configuration
wrangler.jsonc              # Cloudflare Workers & D1 binding
worker-configuration.d.ts   # Auto-generated Cloudflare types
migrations/                 # SQL migration files for D1
public/                     # Static assets (images, fonts)
```

## Contributing

Issues and PRs are welcome. See [AGENTS.md](./AGENTS.md) for AI agent instructions.

## License

This project is licensed under the [MIT License](./LICENSE). See [LICENSES](./LICENSES/) for third-party attributions.

## Acknowledgements

Built with Astro, Tailwind CSS, and TypeScript. Built with a modular, scalable architecture for maintainability and developer experience.

---

<div align="center">

**Made by [Pabitra Mohan Singh](https://www.linkedin.com/in/pabitramohansingh)**

</div>
