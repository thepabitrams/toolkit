# Shared (`shared`)

Cross-tool domain logic and reusable widgets.
**Golden Rule:** If 2 or more tools need the exact same logic or component, it belongs here.

## Folders
- **`components/`**: Composed UI widgets (FileCard, Uploaders). "Dumb" components that receive props.
- **`store/`**: Global Zustand state (e.g., `file-store`).
- **`entities/`**: Pure TypeScript domain logic (Image cropping, EXIF parsing). No React.
- **`lib/`**: Low-level browser utilities (Canvas, Blob conversions).