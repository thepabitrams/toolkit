# Tools (`tools`)

The Plug & Play zone. Every feature is completely isolated.
> **Golden Rule:** Tools can import from `shared` and `core`, but **NEVER** from `config`, `_pages`, or `pages`.

## Universal Structure
Every tool **must** strictly follow this exact colocation structure:

```text
tools/<category>/<tool-name>/
├── index.tsx          # Entry point (re-exports the main component)
├── ToolName.tsx       # Smart Parent (handles layout, Grid, and Cards)
├── Component.tsx      # Dumb Child (Purely UI, no layout wrappers)
├── useToolName.ts     # Local Hook (State, physics, and logic)
└── About.astro        # SEO / How-to text for this tool
```
