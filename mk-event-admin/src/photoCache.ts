// Global in-memory photo cache — fetched once, reused everywhere
import { photosApi } from './api';

const cache = new Map<string, any[]>();
const pending = new Map<string, Promise<any[]>>();

export async function getEventPhotos(eventId: string): Promise<any[]> {
  // Return from cache immediately
  if (cache.has(eventId)) return cache.get(eventId)!;

  // Deduplicate concurrent requests for same event
  if (pending.has(eventId)) return pending.get(eventId)!;

  const p = photosApi.getByEvent(eventId)
    .then(photos => {
      cache.set(eventId, photos || []);
      pending.delete(eventId);
      return photos || [];
    })
    .catch(() => {
      cache.set(eventId, []);
      pending.delete(eventId);
      return [];
    });

  pending.set(eventId, p);
  return p;
}

// Prefetch all event photos at once — call this after events load
export async function prefetchAllPhotos(eventIds: string[]): Promise<void> {
  const uncached = eventIds.filter(id => !cache.has(id) && !pending.has(id));
  if (uncached.length === 0) return;

  // Batch in groups of 5 to avoid overwhelming Render
  const BATCH = 5;
  for (let i = 0; i < uncached.length; i += BATCH) {
    const batch = uncached.slice(i, i + BATCH);
    await Promise.allSettled(batch.map(id => getEventPhotos(id)));
  }
}

export function getCachedPhotos(eventId: string): any[] | null {
  return cache.has(eventId) ? cache.get(eventId)! : null;
}
