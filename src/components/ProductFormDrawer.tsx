import { X, Save, ChevronDown, ChevronUp, ChevronRight, Loader2, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  type Product,
  type ProductFormData,
  CATALOG_PRODUCTS,
  getDefaultProduct,
} from './productStore';

// ─── TYPES ───────────────────────────────────────────────

type DrawerMode = 'add' | 'edit' | 'duplicate';

interface ProductFormDrawerProps {
  mode: DrawerMode;
  product?: Product | null;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
  onDelete?: (product: Product) => void;
}

// ─── HELPERS ─────────────────────────────────────────────

const SEGMENTS: Product['segment'][] = ['Mid Market', 'Enterprise', 'Majors'];
const CATEGORIES: Product['category'][] = ['Add-ons', 'Core'];
const PRICING_MODELS: Product['pricingModel'][] = ['Flat Fee Recurring', 'Consumption', 'Other'];
const BILLING_FREQUENCIES: Product['billingFrequency'][] = ['Monthly', 'Quarterly', 'Annually'];
const PRORATE_OPTIONS: Product['prorateFirstMonth'][] = ['None', 'Prorate', 'Full'];
const RAMP_STRATEGIES: Product['flattenRampStrategy'][] = ['None', 'Average', 'Last Period'];
const CURRENCIES = ['US Dollar', 'EUR', 'GBP'];

// ─── COMPONENT ───────────────────────────────────────────

export function ProductFormDrawer({ mode, product, onClose, onSave, onDelete }: ProductFormDrawerProps) {
  // Initialize form state
  const initData = (): ProductFormData => {
    if (mode === 'edit' && product) {
      const { id, createdAt, ...rest } = product;
      return rest;
    }
    if (mode === 'duplicate' && product) {
      const { id, createdAt, ...rest } = product;
      return { ...rest, name: `${product.name} (Copy)` };
    }
    return getDefaultProduct();
  };

  const [form, setForm] = useState<ProductFormData>(initData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);


  // ─── Field updater ────────────────────────────────────

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  // ─── Validation ───────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.segment) errs.segment = 'Segment is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.pricingModel) errs.pricingModel = 'Pricing model is required';
    if (form.price < 0) errs.price = 'Price cannot be negative';
    if (form.triggersCount < 0) errs.triggersCount = 'Triggers count cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Save ─────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      onSave(form);
    } catch {
      toast.error('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Title ────────────────────────────────────────────

  const title = mode === 'add' ? 'Add Product' : mode === 'edit' ? 'Edit Product' : 'Duplicate Product';
  const subtitle = mode === 'add'
    ? 'Create a new product and configure its details'
    : mode === 'edit'
      ? 'Update product configuration'
      : 'Create a copy with new settings';


  // ─── RENDER ───────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-1/3 min-w-[340px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-5 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] tracking-tight">
              {mode === 'edit' && product ? product.name : title}
            </h2>
            <button onClick={onClose} className="flex-shrink-0 p-1.5 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
              <X className="w-3.5 h-3.5 text-[#999891]" />
            </button>
          </div>
          {mode === 'edit' ? (
            <div className="mt-1.5">
              <label className="block text-[11px] font-medium text-[#1a1a1a] mb-0.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Add description"
                rows={1}
                className="w-full px-2.5 py-1 border border-[#e2e0d8] rounded-md text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[28px] transition-colors placeholder:text-[#999891]"
              />
            </div>
          ) : (
            <p className="text-[11px] text-[#999891] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'edit' ? (
            /* ═══════ EDIT MODE LAYOUT ═══════ */
            <div className="p-4 space-y-4">

              {/* ── SECTION: Details ──────────────────────── */}
              <div>
                <h3 className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Segment</label>
                    <select
                      value={form.segment}
                      onChange={(e) => set('segment', e.target.value as Product['segment'])}
                      className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    >
                      {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.segment && <p className="text-[10px] text-red-600 mt-0.5">{errors.segment}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Category</label>
                      <div className="flex gap-1">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => set('category', cat)}
                            className={`h-7 px-2.5 rounded text-[11px] font-medium transition-all ${
                              form.category === cat
                                ? 'bg-[#1a1a1a] text-white shadow-sm'
                                : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      {errors.category && <p className="text-[10px] text-red-600 mt-0.5">{errors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Status</label>
                      <div className="flex gap-1">
                        {(['Active', 'Inactive'] as const).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set('status', s)}
                            className={`h-7 px-2.5 rounded text-[11px] font-medium transition-all inline-flex items-center gap-1 ${
                              form.status === s
                                ? s === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                                : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${
                              form.status === s
                                ? s === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                                : 'bg-[#999891]'
                            }`} />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-[#e2e0d8]" />

              {/* ── SECTION: Pricing ──────────────────────── */}
              <div>
                <h3 className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Pricing</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Pricing Model</label>
                    <select
                      value={form.pricingModel}
                      onChange={(e) => set('pricingModel', e.target.value as Product['pricingModel'])}
                      className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    >
                      {PRICING_MODELS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                    </select>
                    {errors.pricingModel && <p className="text-[10px] text-red-600 mt-0.5">{errors.pricingModel}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Billing Frequency</label>
                    <select
                      value={form.billingFrequency}
                      onChange={(e) => set('billingFrequency', e.target.value as Product['billingFrequency'])}
                      className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    >
                      {BILLING_FREQUENCIES.map(bf => <option key={bf} value={bf}>{bf}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Currency</label>
                    <select
                      value={form.currency === 'USD' ? 'US Dollar' : form.currency}
                      onChange={(e) => set('currency', e.target.value === 'US Dollar' ? 'USD' : e.target.value)}
                      className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    >
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">List Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price || ''}
                        onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                        className="w-full h-7 px-2 pr-6 border border-[#e2e0d8] rounded text-[11px] tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                        placeholder="0"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#999891]">$</span>
                    </div>
                    {errors.price && <p className="text-[10px] text-red-600 mt-0.5">{errors.price}</p>}
                  </div>
                </div>

                {/* Tiered toggle inline */}
                <div className="flex items-center justify-end gap-2 mt-2">
                  <ToggleRow label="Tiered" checked={form.tiered} onChange={v => set('tiered', v)} />
                </div>
              </div>

              <hr className="border-[#e2e0d8]" />

              {/* ── SECTION: Advanced Settings ────────────── */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full py-0.5 transition-colors"
                >
                  <h3 className="text-[12px] font-semibold text-[#1a1a1a]">Advanced Settings</h3>
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 text-[#999891]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#999891]" />}
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">CRM Product ID</label>
                      <input
                        type="text"
                        value={form.crmProductId}
                        onChange={(e) => set('crmProductId', e.target.value)}
                        className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-[#f5f6f8] text-[11px] text-[#666666]"
                        readOnly
                      />
                      <p className="text-[10px] text-[#999891] mt-0.5">Salesforce Product2 ID</p>
                    </div>

                    <div className="space-y-1">
                      <ToggleRow label="Auto-select in quotes" checked={form.autoSelectedInNewQuotes} onChange={v => set('autoSelectedInNewQuotes', v)} />
                      <ToggleRow label="Pricing page only" checked={form.availableOnlyOnPricingPage} onChange={v => set('availableOnlyOnPricingPage', v)} />
                      <ToggleRow label="Name editable" checked={form.productNameEditable} onChange={v => set('productNameEditable', v)} />
                      <ToggleRow label="Fixed volume (1)" checked={form.hasFixedVolume} onChange={v => set('hasFixedVolume', v)} />
                      <ToggleRow label="Disable tiered pricing" checked={form.disableTieredPricing} onChange={v => set('disableTieredPricing', v)} />
                      <ToggleRow label="Disable volume ramp" checked={form.disableVolumeRamp} onChange={v => set('disableVolumeRamp', v)} />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Display Order</label>
                        <input
                          type="number" min="0" value={form.displayOrder}
                          onChange={(e) => set('displayOrder', parseInt(e.target.value) || 0)}
                          className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Price Precision</label>
                        <input
                          type="number" min="0" max="6" value={form.pricePrecision}
                          onChange={(e) => set('pricePrecision', parseInt(e.target.value) || 2)}
                          className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Min. Price</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#999891]">$</span>
                          <input
                            type="number" min="0" step="0.01" value={form.minimumPrice || ''}
                            onChange={(e) => set('minimumPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 pl-5 pr-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Flatten Ramp</label>
                        <select value={form.flattenRampStrategy} onChange={(e) => set('flattenRampStrategy', e.target.value as any)}
                          className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]">
                          {RAMP_STRATEGIES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Prorate First Mo.</label>
                        <select value={form.prorateFirstMonth} onChange={(e) => set('prorateFirstMonth', e.target.value as any)}
                          className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]">
                          {PRORATE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Prorate Last Mo.</label>
                        <select value={form.prorateLastMonth} onChange={(e) => set('prorateLastMonth', e.target.value as any)}
                          className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]">
                          {PRORATE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Triggers</label>
                        <input
                          type="number" min="0" step="1"
                          value={form.triggersCount}
                          onChange={(e) => set('triggersCount', parseInt(e.target.value) || 0)}
                          className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                          placeholder="0"
                        />
                        {errors.triggersCount && <p className="text-[10px] text-red-600 mt-0.5">{errors.triggersCount}</p>}
                      </div>
                    </div>

                    {/* Product Selection Validation */}
                    <div className="pt-1">
                      <label className="block text-[10px] font-semibold text-[#96854a] mb-1.5">Product Selection Validation</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Product Auto-Selection</label>
                          <MultiProductSelect
                            selected={form.autoSelectionProducts}
                            onChange={(v) => set('autoSelectionProducts', v)}
                            exclude={product?.name}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Product Anti-Selection</label>
                          <MultiProductSelect
                            selected={form.antiSelectionProducts}
                            onChange={(v) => set('antiSelectionProducts', v)}
                            exclude={product?.name}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Order Form Notes</label>
                      <textarea
                        value={form.orderFormNotes}
                        onChange={(e) => set('orderFormNotes', e.target.value)}
                        placeholder="Internal notes for the order form…"
                        rows={2}
                        className="w-full px-2 py-1 border border-[#e2e0d8] rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[40px] placeholder:text-[#999891]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Order Form Tags</label>
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[9px] font-mono text-[#666666]">
                          {`{{${form.name || 'Product Name'} name}}`}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[9px] font-mono text-[#666666]">
                          {`{{${form.name || 'Product Name'} note}}`}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#999891] mt-0.5">Read-only tokens for order form templates</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ═══════ ADD / DUPLICATE MODE LAYOUT ═══════ */
            <div className="p-4 space-y-4">

              {/* ── SECTION: Details ──────────────────────── */}
              <div>
                <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">Details</h3>

                <div className="space-y-3">
                  {/* Product Name */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className="w-full h-7 px-2 border border-[#e2e0d8] rounded text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                      placeholder="Product name"
                    />
                    {errors.name && <p className="text-[10px] text-red-600 mt-0.5">{errors.name}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Optional product description…"
                      rows={1}
                      className="w-full px-2 py-1 border border-[#e2e0d8] rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[28px] transition-colors placeholder:text-[#999891]"
                    />
                  </div>

                  {/* Segment */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                      Segment <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.segment}
                      onChange={(e) => set('segment', e.target.value as Product['segment'])}
                      className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                    >
                      {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.segment && <p className="text-[10px] text-red-600 mt-0.5">{errors.segment}</p>}
                  </div>

                  {/* Category + Status side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-1">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => set('category', cat)}
                            className={`h-7 px-2.5 rounded text-[11px] font-medium transition-all ${
                              form.category === cat
                                ? 'bg-[#1a1a1a] text-white shadow-sm'
                                : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      {errors.category && <p className="text-[10px] text-red-600 mt-0.5">{errors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Status</label>
                      <div className="flex gap-1">
                        {(['Active', 'Inactive'] as const).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set('status', s)}
                            className={`h-7 px-2.5 rounded text-[11px] font-medium transition-all inline-flex items-center gap-1 ${
                              form.status === s
                                ? s === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                                : 'bg-[#f5f6f8] text-[#666666] border border-[#e2e0d8] hover:border-[#1a1a1a]/30'
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${
                              form.status === s
                                ? s === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'
                                : 'bg-[#999891]'
                            }`} />
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-[#e2e0d8]" />

              {/* ── SECTION: Pricing ──────────────────────── */}
              <div>
                <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">Pricing</h3>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                        Pricing Model <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.pricingModel}
                        onChange={(e) => set('pricingModel', e.target.value as Product['pricingModel'])}
                        className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                      >
                        {PRICING_MODELS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                      </select>
                      {errors.pricingModel && <p className="text-[10px] text-red-600 mt-0.5">{errors.pricingModel}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Billing Frequency</label>
                      <select
                        value={form.billingFrequency}
                        onChange={(e) => set('billingFrequency', e.target.value as Product['billingFrequency'])}
                        className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                      >
                        {BILLING_FREQUENCIES.map(bf => <option key={bf} value={bf}>{bf}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">
                        List Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number" step="0.01" min="0"
                          value={form.price || ''}
                          onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                          className="w-full h-7 px-2 pr-6 border border-[#e2e0d8] rounded text-[11px] tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                          placeholder="0.00"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#999891]">$</span>
                      </div>
                      {errors.price && <p className="text-[10px] text-red-600 mt-0.5">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">Triggers</label>
                      <input
                        type="number" min="0" step="1"
                        value={form.triggersCount}
                        onChange={(e) => set('triggersCount', parseInt(e.target.value) || 0)}
                        className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                        placeholder="0"
                      />
                      {errors.triggersCount && <p className="text-[10px] text-red-600 mt-0.5">{errors.triggersCount}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-[#e2e0d8]" />

              {/* ── SECTION: Advanced Settings ────────────── */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 transition-colors w-full py-0.5"
                >
                  {showAdvanced ? <ChevronDown className="w-3 h-3 text-[#999891]" /> : <ChevronRight className="w-3 h-3 text-[#999891]" />}
                  <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Advanced Settings</span>
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1a1a1a] mb-1">CRM Product ID</label>
                      <input
                        type="text"
                        value={form.crmProductId}
                        onChange={(e) => set('crmProductId', e.target.value)}
                        className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] transition-colors"
                        placeholder="e.g. SF-PROD-001"
                      />
                      <p className="text-[10px] text-[#999891] mt-0.5">Optional Salesforce Product2 ID</p>
                    </div>

                    <div className="space-y-1">
                      <ToggleRow label="Tiered pricing" checked={form.tiered} onChange={v => set('tiered', v)} />
                      <ToggleRow label="Auto-selected in new quotes" checked={form.autoSelectedInNewQuotes} onChange={v => set('autoSelectedInNewQuotes', v)} />
                      <ToggleRow label="Available only on Pricing page" checked={form.availableOnlyOnPricingPage} onChange={v => set('availableOnlyOnPricingPage', v)} />
                      <ToggleRow label="Product name is editable" checked={form.productNameEditable} onChange={v => set('productNameEditable', v)} />
                      <ToggleRow label="Has a fixed volume (of 1)" checked={form.hasFixedVolume} onChange={v => set('hasFixedVolume', v)} />
                      <ToggleRow label="Disable tiered pricing" checked={form.disableTieredPricing} onChange={v => set('disableTieredPricing', v)} />
                      <ToggleRow label="Disable volume ramp" checked={form.disableVolumeRamp} onChange={v => set('disableVolumeRamp', v)} />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Display Order</label>
                        <input
                          type="number" min="0" value={form.displayOrder}
                          onChange={(e) => set('displayOrder', parseInt(e.target.value) || 0)}
                          className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Price Precision</label>
                        <input
                          type="number" min="0" max="6" value={form.pricePrecision}
                          onChange={(e) => set('pricePrecision', parseInt(e.target.value) || 2)}
                          className="w-full h-7 px-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Min. Price</label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#999891]">$</span>
                          <input
                            type="number" min="0" step="0.01" value={form.minimumPrice || ''}
                            onChange={(e) => set('minimumPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 pl-5 pr-2 border border-[#e2e0d8] rounded bg-white text-[11px] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Flatten Ramp</label>
                        <select value={form.flattenRampStrategy} onChange={(e) => set('flattenRampStrategy', e.target.value as any)}
                          className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]">
                          {RAMP_STRATEGIES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Prorate First Mo.</label>
                        <select value={form.prorateFirstMonth} onChange={(e) => set('prorateFirstMonth', e.target.value as any)}
                          className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]">
                          {PRORATE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Prorate Last Mo.</label>
                        <select value={form.prorateLastMonth} onChange={(e) => set('prorateLastMonth', e.target.value as any)}
                          className="custom-select w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]">
                          {PRORATE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Order Form Notes</label>
                      <textarea
                        value={form.orderFormNotes}
                        onChange={(e) => set('orderFormNotes', e.target.value)}
                        placeholder="Internal notes for the order form…"
                        rows={2}
                        className="w-full px-2 py-1 border border-[#e2e0d8] rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] resize-y min-h-[40px] placeholder:text-[#999891]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-[#1a1a1a] mb-0.5">Order Form Tags</label>
                      <div className="flex flex-wrap gap-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[9px] font-mono text-[#666666]">
                          {`{{${form.name || 'Product Name'} name}}`}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[9px] font-mono text-[#666666]">
                          {`{{${form.name || 'Product Name'} note}}`}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#999891] mt-0.5">Read-only tokens for order form templates</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-5 py-2.5 flex items-center justify-end gap-2">
          {mode === 'edit' ? (
            <>
              <button
                onClick={() => { if (product && onDelete) onDelete(product); }}
                className="h-7 px-2.5 text-[#333333] text-[11px] font-medium transition-colors hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
              >
                Delete
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 px-3 bg-[#1a1a1a] text-white rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 text-[11px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving…
                  </>
                ) : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-7 px-2.5 border border-[#e2e0d8] rounded hover:bg-[#f9fafb] text-[#333333] text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-7 px-3 bg-[#1a1a1a] text-white rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 text-[11px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    {mode === 'add' ? 'Save' : 'Save Copy'}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TOGGLE ROW ──────────────────────────────────────────

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-px cursor-pointer group gap-2">
      <span className="text-[11px] text-[#1a1a1a] group-hover:text-[#333333] leading-tight">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[16px] w-7 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[var(--switch-checked)]' : 'bg-[#e2e0d8]'
        }`}
      >
        <span className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform mt-[2px] ${
          checked ? 'translate-x-[13px]' : 'translate-x-[2px]'
        }`} />
      </button>
    </label>
  );
}

// ─── MULTI PRODUCT SELECT ────────────────────────────────

function MultiProductSelect({
  selected,
  onChange,
  exclude,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const options = CATALOG_PRODUCTS.filter(c => c.name !== exclude);

  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter(s => s !== name)
        : [...selected, name]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-7 pl-2 pr-7 border border-[#e2e0d8] rounded bg-white text-left text-[11px] flex items-center justify-between transition-colors hover:border-[#1a1a1a]/30 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a]"
      >
        <span className={selected.length > 0 ? 'text-[#1a1a1a] truncate' : 'text-[#999891]'}>
          {selected.length > 0 ? `${selected.length} selected` : 'Select products'}
        </span>
        <ChevronDown className="w-3 h-3 text-[#999891] absolute right-2 top-1/2 -translate-y-1/2" />
      </button>

      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-[#e2e0d8] rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-2 py-3 text-[10px] text-[#999891] text-center">No products available</div>
          ) : (
            options.map(cat => {
              const isSelected = selected.includes(cat.name);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggle(cat.name)}
                  className={`w-full text-left px-2 py-1.5 text-[11px] flex items-center gap-2 transition-colors ${
                    isSelected ? 'bg-[#f5f4f0]' : 'hover:bg-[#f9fafb]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'border-[#e2e0d8]'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <span className="text-[#1a1a1a] truncate">{cat.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selected.map(name => (
            <span key={name} className="inline-flex items-center gap-0.5 pl-1.5 pr-0.5 py-0.5 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[9px] text-[#666666]">
              <span className="truncate max-w-[80px]">{name}</span>
              <button
                type="button"
                onClick={() => onChange(selected.filter(s => s !== name))}
                className="p-0.5 hover:bg-[#e2e0d8] rounded transition-colors"
              >
                <X className="w-2 h-2" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
