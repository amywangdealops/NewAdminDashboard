// Product data model, localStorage persistence, and Salesforce stub

// ─── TYPES ──────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  segment: 'Mid Market' | 'Enterprise' | 'Majors';
  category: 'Add-ons' | 'Core';
  pricingModel: 'Flat Fee Recurring' | 'Consumption' | 'Other';
  price: number;
  currency: string;
  triggersCount: number;
  status: 'Active' | 'Inactive';
  // Advanced fields
  description: string;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  tiered: boolean;
  crmProductId: string;
  orderFormNotes: string;
  // Toggles
  autoSelectedInNewQuotes: boolean;
  availableOnlyOnPricingPage: boolean;
  productNameEditable: boolean;
  hasFixedVolume: boolean;
  disableTieredPricing: boolean;
  disableVolumeRamp: boolean;
  // Numeric / config
  displayOrder: number;
  pricePrecision: number;
  minimumPrice: number;
  prorateFirstMonth: 'None' | 'Prorate' | 'Full';
  prorateLastMonth: 'None' | 'Prorate' | 'Full';
  flattenRampStrategy: 'None' | 'Average' | 'Last Period';
  // Auto/Anti selection stubs
  autoSelectionProducts: string[];
  antiSelectionProducts: string[];
  // Metadata
  createdAt: string;
  priceSource: 'salesforce' | 'manual';
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt'>;

// ─── CATALOG (mock product catalog for dropdown) ─────────

export interface CatalogProduct {
  id: string;
  name: string;
  crmProductId: string;
  defaultPricingModel?: Product['pricingModel'];
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  { id: 'cat-1', name: 'API (per user)', crmProductId: 'SF-PROD-001', defaultPricingModel: 'Flat Fee Recurring' },
  { id: 'cat-2', name: 'Basic Service Module', crmProductId: 'SF-PROD-002', defaultPricingModel: 'Consumption' },
  { id: 'cat-3', name: 'Advanced Analytics', crmProductId: 'SF-PROD-003', defaultPricingModel: 'Flat Fee Recurring' },
  { id: 'cat-4', name: 'Enterprise SSO', crmProductId: 'SF-PROD-004', defaultPricingModel: 'Flat Fee Recurring' },
  { id: 'cat-5', name: 'Data Export Module', crmProductId: 'SF-PROD-005', defaultPricingModel: 'Consumption' },
  { id: 'cat-6', name: 'Premium Support', crmProductId: 'SF-PROD-006', defaultPricingModel: 'Flat Fee Recurring' },
  { id: 'cat-7', name: 'Custom Integration', crmProductId: 'SF-PROD-007', defaultPricingModel: 'Other' },
  { id: 'cat-8', name: 'Compliance Pack', crmProductId: 'SF-PROD-008', defaultPricingModel: 'Flat Fee Recurring' },
];

// ─── SALESFORCE STUB ─────────────────────────────────────

const SF_PRICES: Record<string, number> = {
  'SF-PROD-001': 30,
  'SF-PROD-002': 30,
  'SF-PROD-003': 75,
  'SF-PROD-004': 120,
  'SF-PROD-005': 45,
  'SF-PROD-006': 200,
  'SF-PROD-007': 0, // no price — triggers manual entry scenario
  'SF-PROD-008': 95,
};

/** Simulates fetching list price from Salesforce PricebookEntry */
export async function getSalesforceListPrice(
  crmProductId: string
): Promise<{ price: number | null; found: boolean }> {
  await new Promise(r => setTimeout(r, 300));
  const price = SF_PRICES[crmProductId];
  if (price === undefined || price === 0) {
    return { price: null, found: false };
  }
  return { price, found: true };
}

// ─── DEFAULTS ────────────────────────────────────────────

export function getDefaultProduct(): ProductFormData {
  return {
    name: '',
    segment: 'Mid Market',
    category: 'Add-ons',
    pricingModel: 'Flat Fee Recurring',
    price: 0,
    currency: 'USD',
    triggersCount: 0,
    status: 'Active',
    description: '',
    billingFrequency: 'Monthly',
    tiered: false,
    crmProductId: '',
    orderFormNotes: '',
    autoSelectedInNewQuotes: false,
    availableOnlyOnPricingPage: false,
    productNameEditable: false,
    hasFixedVolume: false,
    disableTieredPricing: false,
    disableVolumeRamp: false,
    displayOrder: 0,
    pricePrecision: 2,
    minimumPrice: 0,
    prorateFirstMonth: 'None',
    prorateLastMonth: 'None',
    flattenRampStrategy: 'None',
    autoSelectionProducts: [],
    antiSelectionProducts: [],
    priceSource: 'manual',
  };
}

// ─── PERSISTENCE ─────────────────────────────────────────

const STORAGE_KEY = 'admin_products';

function getStoredProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAll(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ─── SEED DATA ───────────────────────────────────────────

const SEED_PRODUCTS: Product[] = [
  {
    id: 1, name: 'API (per user)', segment: 'Mid Market', category: 'Add-ons',
    pricingModel: 'Flat Fee Recurring', price: 30, currency: 'USD', triggersCount: 2,
    status: 'Active', description: '', billingFrequency: 'Monthly', tiered: false,
    crmProductId: 'SF-PROD-001', orderFormNotes: '', autoSelectedInNewQuotes: false,
    availableOnlyOnPricingPage: false, productNameEditable: false, hasFixedVolume: false,
    disableTieredPricing: false, disableVolumeRamp: false, displayOrder: 1, pricePrecision: 2,
    minimumPrice: 0, prorateFirstMonth: 'None', prorateLastMonth: 'None',
    flattenRampStrategy: 'None', autoSelectionProducts: [], antiSelectionProducts: [],
    createdAt: '2025-11-01T00:00:00Z', priceSource: 'salesforce',
  },
  {
    id: 2, name: 'Basic Service Module', segment: 'Mid Market', category: 'Core',
    pricingModel: 'Consumption', price: 30, currency: 'USD', triggersCount: 5,
    status: 'Active', description: '', billingFrequency: 'Monthly', tiered: false,
    crmProductId: 'SF-PROD-002', orderFormNotes: '', autoSelectedInNewQuotes: false,
    availableOnlyOnPricingPage: false, productNameEditable: false, hasFixedVolume: false,
    disableTieredPricing: false, disableVolumeRamp: false, displayOrder: 2, pricePrecision: 2,
    minimumPrice: 0, prorateFirstMonth: 'None', prorateLastMonth: 'None',
    flattenRampStrategy: 'None', autoSelectionProducts: [], antiSelectionProducts: [],
    createdAt: '2025-11-01T00:00:00Z', priceSource: 'salesforce',
  },
  {
    id: 3, name: 'Custom Product', segment: 'Enterprise', category: 'Add-ons',
    pricingModel: 'Other', price: 30, currency: 'USD', triggersCount: 3,
    status: 'Active', description: '', billingFrequency: 'Monthly', tiered: false,
    crmProductId: 'SF-PROD-007', orderFormNotes: '', autoSelectedInNewQuotes: false,
    availableOnlyOnPricingPage: false, productNameEditable: false, hasFixedVolume: false,
    disableTieredPricing: false, disableVolumeRamp: false, displayOrder: 3, pricePrecision: 2,
    minimumPrice: 0, prorateFirstMonth: 'None', prorateLastMonth: 'None',
    flattenRampStrategy: 'None', autoSelectionProducts: [], antiSelectionProducts: [],
    createdAt: '2025-11-01T00:00:00Z', priceSource: 'manual',
  },
];

// ─── API LAYER ───────────────────────────────────────────

export function listProducts(): Product[] {
  const stored = getStoredProducts();
  if (stored.length === 0) {
    saveAll(SEED_PRODUCTS);
    return [...SEED_PRODUCTS];
  }
  return stored;
}

export function createProduct(data: ProductFormData): Product {
  const products = getStoredProducts().length > 0 ? getStoredProducts() : [...SEED_PRODUCTS];
  const newProduct: Product = {
    ...data,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  saveAll(products);
  return newProduct;
}

export function updateProduct(id: number, data: Partial<ProductFormData>): Product {
  const products = getStoredProducts().length > 0 ? getStoredProducts() : [...SEED_PRODUCTS];
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  products[idx] = { ...products[idx], ...data };
  saveAll(products);
  return products[idx];
}

export function deleteProduct(id: number): void {
  const products = getStoredProducts().filter(p => p.id !== id);
  saveAll(products);
}
