import { getActiveToolIdentifier } from '../tool-context';
import type { StoreGet } from '../types';

export const handleSelectAll = (bucketName: string, get: StoreGet) => {
  const activeToolId = getActiveToolIdentifier();
  const toolBuckets = get().bucketIndex[activeToolId] || {};
  const bucketIds = toolBuckets[bucketName] || [];
  const detailMap = get().fileDetailMap;
  return bucketIds.map((id) => detailMap[id]).filter(Boolean);
};