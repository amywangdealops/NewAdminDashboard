import { X, Edit, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { Product } from './productStore';

interface ViewProductDrawerProps {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export function ViewProductDrawer({ product, onClose, onEdit }: ViewProductDrawerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatPrice = (val: number) => `$${val.toFixed(product.pricePrecision ?? 2)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-1/3 min-w-[340px] shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e2e0d8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Package className="w-4 h-4 text-[#1a1a1a] flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight truncate">{product.name}</h2>
              <p className="text-[12px] text-[#999891] mt-0.5">Product details</p>
            </div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-[#f9fafb] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20" aria-label="Close">
            <X className="w-4 h-4 text-[#999891]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ── Details Section ───────────────────────── */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Details</h3>
              <div className="space-y-3">
                <ReadOnlyField label="Product Name" value={product.name} />
                <ReadOnlyField label="Segment" value={product.segment} />
                <ReadOnlyField label="Category">
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                    {product.category}
                  </span>
                </ReadOnlyField>
                <ReadOnlyField label="Status">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                    product.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${product.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {product.status}
                  </span>
                </ReadOnlyField>
                {product.description && (
                  <ReadOnlyField label="Description" value={product.description} />
                )}
              </div>
            </div>

            {/* ── Pricing Section ──────────────────────── */}
            <div>
              <h3 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-4">Pricing</h3>
              <div className="space-y-3">
                <ReadOnlyField label="Pricing Model" value={product.pricingModel} />
                <ReadOnlyField label="Price">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#1a1a1a] tabular-nums">{formatPrice(product.price)}</span>
                    <span className="text-[11px] text-[#999891]">{product.currency}</span>
                  </div>
                </ReadOnlyField>
                <ReadOnlyField label="Billing Frequency" value={product.billingFrequency} />
                <ReadOnlyField label="Triggers" value={String(product.triggersCount)} />
                <ReadOnlyField label="Currency" value={product.currency} />
                <ReadOnlyField label="Tiered" value={product.tiered ? 'Yes' : 'No'} />
              </div>
            </div>

            {/* ── Advanced Section ─────────────────────── */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-[13px] font-medium text-[#1a1a1a] hover:text-[#333333] transition-colors w-full"
              >
                {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Advanced</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-3">
                  <ReadOnlyField label="CRM Product ID" value={product.crmProductId || '—'} mono />
                  <ReadOnlyField label="Display Order" value={String(product.displayOrder)} />
                  <ReadOnlyField label="Price Precision" value={`${product.pricePrecision} decimals`} />
                  <ReadOnlyField label="Minimum Price" value={product.minimumPrice > 0 ? formatPrice(product.minimumPrice) : '—'} />
                  <ReadOnlyField label="Prorate First Month" value={product.prorateFirstMonth} />
                  <ReadOnlyField label="Prorate Last Month" value={product.prorateLastMonth} />
                  <ReadOnlyField label="Flatten Ramp Strategy" value={product.flattenRampStrategy} />

                  <div className="pt-2 border-t border-[#f0f1f4]">
                    <h4 className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-3">Toggles</h4>
                    <div className="space-y-2">
                      <ToggleDisplay label="Auto-selected in new quotes" value={product.autoSelectedInNewQuotes} />
                      <ToggleDisplay label="Available only on Pricing page" value={product.availableOnlyOnPricingPage} />
                      <ToggleDisplay label="Product name is editable" value={product.productNameEditable} />
                      <ToggleDisplay label="Has a fixed volume (of 1)" value={product.hasFixedVolume} />
                      <ToggleDisplay label="Disable tiered pricing" value={product.disableTieredPricing} />
                      <ToggleDisplay label="Disable volume ramp" value={product.disableVolumeRamp} />
                    </div>
                  </div>

                  {product.orderFormNotes && (
                    <ReadOnlyField label="Order Form Notes" value={product.orderFormNotes} />
                  )}

                  {/* Order Form Tags */}
                  <div>
                    <span className="block text-[11px] font-medium text-[#999891] uppercase tracking-wider mb-1">Order Form Tags</span>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[11px] font-mono text-[#666666]">
                        {`{{${product.name} name}}`}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 bg-[#f5f6f8] border border-[#e2e0d8] rounded text-[11px] font-mono text-[#666666]">
                        {`{{${product.name} note}}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#e2e0d8] px-6 py-3.5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-8 px-3 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] text-[#333333] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(product)}
            className="h-8 px-4 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Read-only field ─────────────────────────────────────

function ReadOnlyField({
  label,
  value,
  children,
  mono = false,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-[12px] text-[#999891] flex-shrink-0 w-36">{label}</span>
      {children || (
        <span className={`text-[13px] text-[#1a1a1a] text-right ${mono ? 'font-mono text-[12px]' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Toggle display ──────────────────────────────────────

function ToggleDisplay({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[12px] text-[#999891]">{label}</span>
      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
        value ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
      }`}>
        {value ? 'On' : 'Off'}
      </span>
    </div>
  );
}
