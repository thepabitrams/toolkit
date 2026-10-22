// src/shared/store/file-store/tool-context.ts
let activeToolIdentifier = 'default';

export const setActiveToolIdentifier = (toolId: string) => {
  activeToolIdentifier = toolId;
};

export const getActiveToolIdentifier = () => activeToolIdentifier;