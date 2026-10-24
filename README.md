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
- **Image Processing:** [React Easy Crop](https://github.com/ValentinH/react-easy-crop), [React Dropzone](https://react-dropzone.js.org/), [ExifTool](https://exiftool.org/)
- **Local Database:** [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via `idb`
- **Runtime:** [Cloudflare Workers](https://workers.cloudflare.com)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **Authentication:** [Better Auth](https://better-auth.com)
- **Package Manager:** [pnpm](https://pnpm.io)

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
   ```
   pnpm exec wrangler d1 migrations apply toolkit-db --local
   ```

Start the development server:
   ```
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
