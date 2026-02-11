// Simple localStorage-based store for approval triggers created via templates or wizard

export interface StoredTrigger {
  id: number;
  name: string;
  when: string;
  then: string[];
  scope: string[];
  status: 'active' | 'paused';
  category: string; // 'pricing' | 'terms' | 'custom'
  impact: { deals: number; avgTime: string };
  createdAt: string;
  fromTemplate?: string;
}

const STORAGE_KEY = 'approval_triggers';

export function getSavedTriggers(): StoredTrigger[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTrigger(
  trigger: Omit<StoredTrigger, 'id' | 'createdAt'>
): StoredTrigger {
  const triggers = getSavedTriggers();
  const newTrigger: StoredTrigger = {
    ...trigger,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  triggers.push(newTrigger);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(triggers));
  return newTrigger;
}

export function deleteTrigger(id: number): void {
  const triggers = getSavedTriggers().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(triggers));
}

