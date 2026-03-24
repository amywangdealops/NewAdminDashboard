// Metric data model, localStorage persistence, and CRUD

// ─── TYPES ──────────────────────────────────────────────

export type MetricType = 'Financial' | 'Operational' | 'Custom';
export type CalculationMethod = 'Sum' | 'Average' | 'Formula' | 'Manual';
export type MetricFormat = 'Currency' | 'Percentage' | 'Number';
export type DataSource = 'CRM' | 'Manual' | 'Calculated';
export type MetricFrequency = 'Real-time' | 'Daily' | 'Monthly' | 'Quarterly';
export type DealType = 'New Business' | 'Amendment' | 'Renewal';

export const DEAL_TYPES: DealType[] = ['New Business', 'Amendment', 'Renewal'];

export interface Metric {
  id: number;
  name: string;
  description: string;
  type: MetricType;
  calculationMethod: CalculationMethod;
  format: MetricFormat;
  segment: 'All' | 'Mid Market' | 'Enterprise' | 'Majors';
  dataSource: DataSource;
  frequency: MetricFrequency;
  status: 'Active' | 'Inactive';
  usedInCount: number;
  displayOrder: number;
  formula: string;
  precision: number;
  dealTypes: DealType[];
  createdAt: string;
}

export type MetricFormData = Omit<Metric, 'id' | 'createdAt'>;

// ─── DEFAULTS ────────────────────────────────────────────

export function getDefaultMetric(): MetricFormData {
  return {
    name: '',
    description: '',
    type: 'Financial',
    calculationMethod: 'Sum',
    format: 'Currency',
    segment: 'All',
    dataSource: 'Calculated',
    frequency: 'Monthly',
    status: 'Active',
    usedInCount: 0,
    displayOrder: 0,
    formula: '',
    precision: 2,
    dealTypes: [],
  };
}

// ─── PERSISTENCE ─────────────────────────────────────────

const STORAGE_KEY = 'admin_metrics';

function getStoredMetrics(): Metric[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAll(metrics: Metric[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
}

// ─── SEED DATA ───────────────────────────────────────────

const SEED_METRICS: Metric[] = [
  {
    id: 1, name: 'TCV', description: 'Total Contract Value — the full value of a contract over its entire term, including all recurring and one-time charges.',
    type: 'Financial', calculationMethod: 'Sum', format: 'Currency', segment: 'All',
    dataSource: 'CRM', frequency: 'Real-time', status: 'Active', usedInCount: 8,
    displayOrder: 1, formula: '', precision: 2, dealTypes: ['New Business', 'Amendment', 'Renewal'], createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 2, name: 'ARR', description: 'Annual Recurring Revenue — the annualized value of all active recurring subscriptions.',
    type: 'Financial', calculationMethod: 'Sum', format: 'Currency', segment: 'All',
    dataSource: 'Calculated', frequency: 'Daily', status: 'Active', usedInCount: 12,
    displayOrder: 2, formula: 'MRR × 12', precision: 2, dealTypes: ['New Business', 'Renewal'], createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 3, name: 'Net New ARR', description: 'The net change in ARR from new business, expansion, contraction, and churn over a given period.',
    type: 'Financial', calculationMethod: 'Formula', format: 'Currency', segment: 'All',
    dataSource: 'Calculated', frequency: 'Monthly', status: 'Active', usedInCount: 6,
    displayOrder: 3, formula: 'New ARR + Expansion ARR − Contraction ARR − Churned ARR', precision: 2, dealTypes: ['New Business'], createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 4, name: 'First Year ACV', description: 'Annual Contract Value for the first year of a deal, excluding ramp periods and one-time fees.',
    type: 'Financial', calculationMethod: 'Sum', format: 'Currency', segment: 'All',
    dataSource: 'CRM', frequency: 'Real-time', status: 'Active', usedInCount: 5,
    displayOrder: 4, formula: '', precision: 2, dealTypes: ['New Business'], createdAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 5, name: 'First Year Revenue', description: 'Total recognized revenue in the first 12 months of a contract, including prorated and ramped amounts.',
    type: 'Financial', calculationMethod: 'Formula', format: 'Currency', segment: 'All',
    dataSource: 'Calculated', frequency: 'Monthly', status: 'Active', usedInCount: 4,
    displayOrder: 5, formula: 'Sum of monthly recognized revenue (months 1–12)', precision: 2, dealTypes: ['New Business', 'Amendment'], createdAt: '2025-10-15T00:00:00Z',
  },
];

// ─── API LAYER ───────────────────────────────────────────

export function listMetrics(): Metric[] {
  const stored = getStoredMetrics();
  if (stored.length === 0) {
    saveAll(SEED_METRICS);
    return [...SEED_METRICS];
  }
  const migrated = stored.map(m => ({
    ...m,
    dealTypes: m.dealTypes ?? [],
  }));
  return migrated;
}

export function createMetric(data: MetricFormData): Metric {
  const metrics = getStoredMetrics().length > 0 ? getStoredMetrics() : [...SEED_METRICS];
  const newMetric: Metric = {
    ...data,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  metrics.push(newMetric);
  saveAll(metrics);
  return newMetric;
}

export function updateMetric(id: number, data: Partial<MetricFormData>): Metric {
  const metrics = getStoredMetrics().length > 0 ? getStoredMetrics() : [...SEED_METRICS];
  const idx = metrics.findIndex(m => m.id === id);
  if (idx === -1) throw new Error('Metric not found');
  metrics[idx] = { ...metrics[idx], ...data };
  saveAll(metrics);
  return metrics[idx];
}

export function deleteMetric(id: number): void {
  const metrics = getStoredMetrics().filter(m => m.id !== id);
  saveAll(metrics);
}
