let activeToolIdentifier = 'default';

export const setActiveToolIdentifier = (toolId: string) => {
  activeToolIdentifier = toolId;
};

export const getActiveToolIdentifier = () => activeToolIdentifier;