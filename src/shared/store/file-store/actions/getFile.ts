import { getActiveToolIdentifier } from '../tool-context';
import type { StoreGet } from '../types';

export const handleGetFile = (bucketName: string, identifier: string | number, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const detailMap = get().fileDetailMap;
  const bucketIds = get().bucketIndex[activeToolId]?.[bucketName] || [];

  let targetId: string | undefined;

  if (typeof identifier === 'number') {
    targetId = bucketIds[identifier];
  } else {
    targetId = bucketIds.find((id) => detailMap[id]?.name === identifier);
  }

  return targetId ? detailMap[targetId] : undefined;
};