export interface Term {
  id: number;
  name: string;
  description: string;
  segments: string[];
  category: 'Core Terms' | 'Custom Terms';
  inputType: 'Date' | 'Select' | 'Number' | 'Text' | 'Select With Other';
  options: string[];
  status: 'On' | 'Off';
  orderFormNote: string;
  createdAt: string;
}

export type TermFormData = Omit<Term, 'id' | 'createdAt'>;

export const SEGMENTS = ['All segments', 'Mid Market', 'Enterprise', 'Majors'] as const;
export const CATEGORIES: Term['category'][] = ['Core Terms', 'Custom Terms'];
export const INPUT_TYPES: Term['inputType'][] = ['Date', 'Select', 'Number', 'Text', 'Select With Other'];

export function getDefaultTerm(): TermFormData {
  return {
    name: '',
    description: '',
    segments: [],
    category: 'Core Terms',
    inputType: 'Text',
    options: [],
    status: 'On',
    orderFormNote: '',
  };
}

const STORAGE_KEY = 'admin_terms';

function getStoredTerms(): Term[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAll(terms: Term[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
}

const SEED_TERMS: Term[] = [
  {
    id: 1, name: 'Start Date', description: '', segments: [],
    category: 'Core Terms', inputType: 'Date', options: [], status: 'On',
    orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 2, name: 'End Date', description: '', segments: [],
    category: 'Core Terms', inputType: 'Date', options: [], status: 'On',
    orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 3, name: 'Subscription Terms', description: '', segments: [],
    category: 'Core Terms', inputType: 'Select',
    options: ['12 months', '24 months', '36 months', '48 months'],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 4, name: 'Billing Frequency', description: '', segments: [],
    category: 'Core Terms', inputType: 'Select',
    options: ['Annual', 'Semi-Annually', 'Quarterly', 'Monthly'],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 5, name: 'Payment Terms', description: '', segments: [],
    category: 'Core Terms', inputType: 'Select',
    options: ['Net 30', 'Net 60', 'Net 90'],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 6, name: 'Auto Renewal', description: '', segments: [],
    category: 'Core Terms', inputType: 'Select',
    options: ['Yes', 'No'],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 7, name: 'Logo Rights', description: '', segments: [],
    category: 'Core Terms', inputType: 'Select',
    options: ['Full Logo Rights', 'Limited Logo Rights', 'No Logo Rights'],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 8, name: 'Opt Out', description: '', segments: [],
    category: 'Core Terms', inputType: 'Select',
    options: ['No', 'Yes'],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 9, name: 'Opt Out (Length)', description: '', segments: [],
    category: 'Core Terms', inputType: 'Number', options: [],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 10, name: "T&C's", description: '', segments: [],
    category: 'Core Terms', inputType: 'Select With Other',
    options: ["Standard T&C's", 'Reference Attached MSA'],
    status: 'On', orderFormNote: '', createdAt: '2025-11-01T00:00:00Z',
  },
];

export function listTerms(): Term[] {
  const stored = getStoredTerms();
  if (stored.length === 0) {
    saveAll(SEED_TERMS);
    return [...SEED_TERMS];
  }
  return stored;
}

export function createTerm(data: TermFormData): Term {
  const terms = getStoredTerms().length > 0 ? getStoredTerms() : [...SEED_TERMS];
  const newTerm: Term = {
    ...data,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  terms.push(newTerm);
  saveAll(terms);
  return newTerm;
}

export function updateTerm(id: number, data: Partial<TermFormData>): Term {
  const terms = getStoredTerms().length > 0 ? getStoredTerms() : [...SEED_TERMS];
  const idx = terms.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Term not found');
  terms[idx] = { ...terms[idx], ...data };
  saveAll(terms);
  return terms[idx];
}

export function deleteTerm(id: number): void {
  const terms = getStoredTerms().filter(t => t.id !== id);
  saveAll(terms);
}

export function reorderTerms(orderedIds: number[]): void {
  const terms = getStoredTerms().length > 0 ? getStoredTerms() : [...SEED_TERMS];
  const byId = new Map(terms.map(t => [t.id, t]));
  const reordered = orderedIds.map(id => byId.get(id)).filter((t): t is Term => !!t);
  const remaining = terms.filter(t => !orderedIds.includes(t.id));
  saveAll([...reordered, ...remaining]);
}
