import { Layers, Copy, Search, Plus, Filter, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CreateTriggerModal, TriggerPrefill } from './CreateTriggerModal';

type TemplateCategory = 'All' | 'Product Discounts' | 'Product Attachment' | 'Billing Frequency' | 'Payment Terms' | 'Subscription Terms';

function AnimatedCollapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <div
      className="overflow-hidden transition-[height,opacity] duration-200 ease-in-out"
      style={{ height, opacity: open ? 1 : 0 }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isExpanded,
  onToggle,
  onUseTemplate,
  compact,
}: {
  template: { name: string; description: string; category: string; uses: number };
  isExpanded: boolean;
  onToggle: () => void;
  onUseTemplate: () => void;
  compact: boolean;
}) {
  const categoryStyle = (() => {
    switch (template.category) {
      case 'Billing Frequency':
        return 'bg-blue-50 text-blue-600';
      case 'Payment Terms':
        return 'bg-amber-50 text-amber-600';
      case 'Product Discounts':
        return 'bg-emerald-50 text-emerald-600';
      case 'Product Attachment':
        return 'bg-purple-50 text-purple-600';
      case 'Subscription Terms':
        return 'bg-rose-50 text-rose-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  })();

  return (
    <div
      className={`group bg-white rounded-lg border border-[#e5e7eb] flex flex-col
        transition-all duration-200
        hover:shadow-[0_4px_16px_rgba(66,98,255,0.08)] hover:border-[#4262FF]/25
        ${isExpanded ? 'shadow-[0_4px_16px_rgba(66,98,255,0.08)] border-[#4262FF]/25' : ''}
        ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Top: Icon + Title */}
      <div
        className="flex items-start gap-2.5 cursor-pointer select-none"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${template.name}`}
      >
        <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-md bg-[#4262FF]/[0.08] flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-[#4262FF]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold text-[#111827] leading-snug
              ${compact ? 'text-[11px] line-clamp-1' : 'text-[13px] line-clamp-2'}`}
          >
            {template.name}
          </h3>
          {!compact && (
            <button
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[#9ca3af] hover:text-[#4262FF] transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              tabIndex={-1}
            >
              {isExpanded ? 'Hide details' : 'View details'}
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Description */}
      {!compact && (
        <AnimatedCollapse open={isExpanded}>
          <p className="text-[12px] text-[#6b7280] leading-relaxed mt-2 ml-[38px] pr-1">
            {template.description}
          </p>
        </AnimatedCollapse>
      )}

      {/* Spacer */}
      <div className="flex-1 min-h-2" />

      {/* Category tag */}
      <div className={`ml-[38px] ${compact ? 'mt-1.5' : 'mt-2.5'}`}>
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${categoryStyle}`}
        >
          {template.category}
        </span>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between border-t border-[#f0f1f4] ml-0 ${compact ? 'pt-2 mt-2' : 'pt-3 mt-3'}`}>
        <span className="text-[11px] text-[#9ca3af] tabular-nums">
          Used {template.uses} {template.uses === 1 ? 'time' : 'times'}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onUseTemplate(); }}
          className={`inline-flex items-center gap-1.5 border border-[#e5e7eb] rounded-md
            text-[#374151] font-medium transition-all duration-150
            hover:bg-[#f9fafb] hover:border-[#4262FF]/25 hover:text-[#4262FF]
            active:scale-[0.98]
            ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'}`}
          aria-label={`Use template: ${template.name}`}
        >
          <Copy className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
          Use Template
        </button>
      </div>
    </div>
  );
}

export function Templates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [compact, setCompact] = useState(false);

  const categories: TemplateCategory[] = ['All', 'Product Discounts', 'Product Attachment', 'Billing Frequency', 'Payment Terms', 'Subscription Terms'];

  const templates = [
    {
      name: "Mid-Market semi-annual/quarterly billing (developed) requires Head of Mid-Market",
      description: "For Mid-Market deals in developed countries, if billing frequency is Semi-annual, Quarterly, or Other, require Head of Mid-Market approval. Does not apply to expansion deals where billing frequency matches previous.",
      category: "Billing Frequency",
      uses: 67
    },
    {
      name: "Non-annual billing for new customer requires Deal Desk",
      description: "If billing frequency is not annual upfront for a new customer, require Deal Desk approval before proceeding.",
      category: "Billing Frequency",
      uses: 53
    },
    {
      name: "Non-annual billing for existing customer requires VP of Sales",
      description: "If billing frequency is not annual upfront for an existing customer, require VP of Sales approval. For expansion deals, this rule does not apply if billing frequency matches the previous billing frequency.",
      category: "Billing Frequency",
      uses: 48
    },
    {
      name: "Billing frequency \"Other\" requires Deal Desk",
      description: "Any deal with a billing frequency set to \"Other\" requires Deal Desk review and approval.",
      category: "Billing Frequency",
      uses: 41
    },
    {
      name: "Non-Mid-Market quarterly/other billing requires Deal Desk",
      description: "For non-Mid-Market deals, if billing frequency is Quarterly or Other, require Deal Desk approval.",
      category: "Billing Frequency",
      uses: 36
    },
    {
      name: "Mid-Market quarterly billing (developing) requires Deal Desk",
      description: "For Mid-Market deals in developing countries, if billing frequency is Quarterly, require Deal Desk approval. Does not apply to expansion deals where billing matches previous.",
      category: "Billing Frequency",
      uses: 29
    },
    {
      name: "Non-Net 30 payment terms require Deal Desk + VP of Sales",
      description: "If payment terms are not Net 30, both Deal Desk and VP of Sales approval are required. For expansion deals, this rule does not apply if payment terms match the previous deal.",
      category: "Payment Terms",
      uses: 62
    },
    {
      name: "Price protection enabled requires Deal Desk + Deal Ops",
      description: "If price protection is enabled on a deal, require both Deal Desk and Deal Ops approval. Additional Head of Mid-Market approval for Mid-Market segment; additional Deal Desk for Enterprise segment.",
      category: "Product Discounts",
      uses: 55
    },
    {
      name: "Price lock on Mid-Market deals requires Head of Mid-Market",
      description: "If price lock is enabled on a Mid-Market deal, require Head of Mid-Market approval.",
      category: "Product Discounts",
      uses: 31
    },
    {
      name: "Price lock on non-Mid-Market deals requires Deal Desk",
      description: "If price lock is enabled on deals outside the Mid-Market segment, require Deal Desk approval.",
      category: "Product Discounts",
      uses: 27
    },
    {
      name: "Custom Product requires Deal Desk + Deal Ops",
      description: "If any product on the deal is a 'Custom Product', require both Deal Desk and Deal Ops approval before the deal can proceed.",
      category: "Products",
      uses: 44
    },
    {
      name: "API product requires Deal Desk",
      description: "If the deal includes the 'API' product, require Deal Desk review and approval.",
      category: "Products",
      uses: 38
    },
    {
      name: "Subscription term out of range requires Deal Desk",
      description: "If subscription term is less than 12 months or greater than 24 months and the opportunity is not an Expansion, require Deal Desk approval.",
      category: "Subscription Terms",
      uses: 50
    },
    {
      name: "Non-Mid-Market non-EMEA non-annual billing (new) requires VP of Sales",
      description: "For non-Mid-Market, non-EMEA deals, if billing frequency is not annual upfront for a new customer, require VP of Sales approval.",
      category: "Billing Frequency",
      uses: 22
    },
    {
      name: "EMEA non-annual billing for existing customer requires VP of Sales (EMEA)",
      description: "For non-Mid-Market EMEA deals, if billing frequency is not annual upfront for an existing customer, require VP of Sales (EMEA). Does not apply to expansion deals where billing frequency matches previous.",
      category: "Billing Frequency",
      uses: 19
    },
    {
      name: "Special products (Vault, Credits) require Deal Desk",
      description: "If the deal includes 'Vault as Add-on', 'Yearly Credit', or 'One-time Credit' products, require Deal Desk review and approval.",
      category: "Products",
      uses: 33
    },
  ];

  const handleAddTemplate = () => {
    toast.info('Add Template functionality coming soon');
  };

  const handleUseTemplate = (templateName: string) => {
    setShowCreateModal(true);
  };

  const toggleExpanded = useCallback((idx: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const query = searchQuery.toLowerCase();
    return matchesCategory && (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-[#e5e7eb] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#111827] tracking-tight">Templates & Defaults</h1>
            <p className="text-[#9ca3af] text-[12px] mt-0.5">
              Pre-built approval trigger templates you can clone and customize
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] focus:bg-white text-[12px] transition-all placeholder:text-[#9ca3af]"
                aria-label="Search templates"
              />
            </div>
            <button
              onClick={handleAddTemplate}
              className="h-8 px-3 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
              aria-label="Add new template"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Template
            </button>
          </div>
        </div>

        {/* Category Filters + View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
                  activeCategory === cat
                    ? 'bg-[#4262FF] text-white shadow-sm'
                    : 'bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#374151]'
                }`}
            >
              {cat}
            </button>
          ))}
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-0.5 bg-[#f3f4f6] rounded-md p-0.5 flex-shrink-0">
            <button
              onClick={() => setCompact(false)}
              className={`p-1.5 rounded transition-all duration-150 ${
                !compact ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9ca3af] hover:text-[#374151]'
              }`}
              aria-label="Default view"
              title="Default view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCompact(true)}
              className={`p-1.5 rounded transition-all duration-150 ${
                compact ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9ca3af] hover:text-[#374151]'
              }`}
              aria-label="Compact view"
              title="Compact view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-[#f3f4f6] flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-[#d1d5db]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#111827] mb-1">
              {searchQuery ? `No templates found matching "${searchQuery}"` : 'No templates found'}
            </h3>
            <p className="text-[12px] text-[#9ca3af]">
              {searchQuery ? 'Try a different search term' : 'Create your first template to get started'}
            </p>
          </div>
        ) : (
          <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {filteredTemplates.map((template, idx) => (
              <TemplateCard
              key={idx}
                template={template}
                isExpanded={expandedCards.has(idx)}
                onToggle={() => toggleExpanded(idx)}
                onUseTemplate={() => handleUseTemplate(template.name)}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTriggerModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
