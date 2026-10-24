# Config

The single source of truth for global configuration. 
**Rule:** No React components allowed in this folder.

- **`site.ts`**: Global metadata (SEO, author, social links).
- **`tools.ts`**: The master registry for all tools (slugs, descriptions, dynamic imports).
- **`motion.ts`**: Global motion primitives (`spring`, `duration`) and semantic presets (`fadeIn`, `slideUp`). 
  > *Keep component-specific animations local to their component folder.*