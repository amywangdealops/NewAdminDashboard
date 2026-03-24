import {
  Layers, Copy, Search, Plus, Filter, X, ChevronDown,
  ArrowRight, LayoutGrid, Trash2, Users, Target, Zap,
  AlertTriangle, Info, Shield, ListFilter,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CreateTriggerModal } from './CreateTriggerModal';
import { getAllTriggers, matchTriggersByConditions, saveTrigger, type MatchedTrigger } from './triggerStore';

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

interface TemplateBlock {
  name: string;
  condition: { field: string; operator: string; value: string };
  approvers: string[];
  scope: { segments?: string[]; regions?: string[]; dealTypes?: string[] };
  category: string;
  uses: number;
}

type TemplateCategory = 'All' | 'Product Discounts' | 'Products' | 'Billing Frequency' | 'Payment Terms' | 'Subscription Terms';

// ---------------------------------------------------------------------------
// Color system — deepened for authority
//
// WHEN  (conditions) : slate  #5d7f8e
// THEN  (approvers)  : sage   #5a7d63
// FOR   (scopes)     : stone  #8a7a68
// ---------------------------------------------------------------------------

const BLOCK_COLORS = {
  when: {
    accent: '#5d7f8e',
    bg: 'bg-white',
    border: 'border-[#e2e0d8]',
    borderActive: 'border-[#5d7f8e]',
    text: 'text-[#1a1a1a]',
    textMuted: 'text-[#666]',
    label: 'text-[#5d7f8e]',
    hoverBg: 'hover:bg-[#f5f7f8]',
    activeBorder: 'border-l-[#5d7f8e]',
    activeBg: 'bg-[#f5f7f8]',
  },
  then: {
    accent: '#5a7d63',
    bg: 'bg-white',
    border: 'border-[#e2e0d8]',
    borderActive: 'border-[#5a7d63]',
    text: 'text-[#1a1a1a]',
    textMuted: 'text-[#666]',
    label: 'text-[#5a7d63]',
    hoverBg: 'hover:bg-[#f5f8f6]',
    activeBorder: 'border-l-[#5a7d63]',
    activeBg: 'bg-[#f5f8f6]',
  },
  scope: {
    accent: '#8a7a68',
    bg: 'bg-white',
    border: 'border-[#e2e0d8]',
    borderActive: 'border-[#8a7a68]',
    text: 'text-[#1a1a1a]',
    textMuted: 'text-[#666]',
    label: 'text-[#8a7a68]',
    hoverBg: 'hover:bg-[#f8f7f5]',
    activeBorder: 'border-l-[#8a7a68]',
    activeBg: 'bg-[#f8f7f5]',
  },
} as const;

// ---------------------------------------------------------------------------
// Structured template data (all 16)
// ---------------------------------------------------------------------------

const TEMPLATES: TemplateBlock[] = [
  {
    name: 'Mid-Market semi-annual/quarterly billing (developed) requires Head of Mid-Market',
    condition: { field: 'Billing Frequency', operator: 'is one of', value: 'Semi-annual, Quarterly, Other' },
    approvers: ['Head of Mid-Market'],
    scope: { segments: ['Mid-Market'], regions: ['Developed'] },
    category: 'Billing Frequency',
    uses: 67,
  },
  {
    name: 'Non-annual billing for new customer requires Deal Desk',
    condition: { field: 'Billing Frequency', operator: 'is not', value: 'Annual Upfront' },
    approvers: ['Deal Desk'],
    scope: { dealTypes: ['New Customer'] },
    category: 'Billing Frequency',
    uses: 53,
  },
  {
    name: 'Non-annual billing for existing customer requires VP of Sales',
    condition: { field: 'Billing Frequency', operator: 'is not', value: 'Annual Upfront' },
    approvers: ['VP of Sales'],
    scope: { dealTypes: ['Existing Customer'] },
    category: 'Billing Frequency',
    uses: 48,
  },
  {
    name: 'Billing frequency "Other" requires Deal Desk',
    condition: { field: 'Billing Frequency', operator: 'equals', value: 'Other' },
    approvers: ['Deal Desk'],
    scope: {},
    category: 'Billing Frequency',
    uses: 41,
  },
  {
    name: 'Non-Mid-Market quarterly/other billing requires Deal Desk',
    condition: { field: 'Billing Frequency', operator: 'is one of', value: 'Quarterly, Other' },
    approvers: ['Deal Desk'],
    scope: { segments: ['Non-Mid-Market'] },
    category: 'Billing Frequency',
    uses: 36,
  },
  {
    name: 'Mid-Market quarterly billing (developing) requires Deal Desk',
    condition: { field: 'Billing Frequency', operator: 'equals', value: 'Quarterly' },
    approvers: ['Deal Desk'],
    scope: { segments: ['Mid-Market'], regions: ['Developing'] },
    category: 'Billing Frequency',
    uses: 29,
  },
  {
    name: 'Non-Net 30 payment terms require Deal Desk + VP of Sales',
    condition: { field: 'Payment Terms', operator: 'is not', value: 'Net 30' },
    approvers: ['Deal Desk', 'VP of Sales'],
    scope: {},
    category: 'Payment Terms',
    uses: 62,
  },
  {
    name: 'Price protection enabled requires Deal Desk + Deal Ops',
    condition: { field: 'Price Protection', operator: 'equals', value: 'Enabled' },
    approvers: ['Deal Desk', 'Deal Ops'],
    scope: {},
    category: 'Product Discounts',
    uses: 55,
  },
  {
    name: 'Price lock on Mid-Market deals requires Head of Mid-Market',
    condition: { field: 'Price Lock', operator: 'equals', value: 'Enabled' },
    approvers: ['Head of Mid-Market'],
    scope: { segments: ['Mid-Market'] },
    category: 'Product Discounts',
    uses: 31,
  },
  {
    name: 'Price lock on non-Mid-Market deals requires Deal Desk',
    condition: { field: 'Price Lock', operator: 'equals', value: 'Enabled' },
    approvers: ['Deal Desk'],
    scope: { segments: ['Non-Mid-Market'] },
    category: 'Product Discounts',
    uses: 27,
  },
  {
    name: 'Custom Product requires Deal Desk + Deal Ops',
    condition: { field: 'Product Type', operator: 'equals', value: 'Custom Product' },
    approvers: ['Deal Desk', 'Deal Ops'],
    scope: {},
    category: 'Products',
    uses: 44,
  },
  {
    name: 'API product requires Deal Desk',
    condition: { field: 'Product', operator: 'includes', value: 'API' },
    approvers: ['Deal Desk'],
    scope: {},
    category: 'Products',
    uses: 38,
  },
  {
    name: 'Subscription term out of range requires Deal Desk',
    condition: { field: 'Subscription Term', operator: 'outside', value: '12–24 months' },
    approvers: ['Deal Desk'],
    scope: { dealTypes: ['New Business'] },
    category: 'Subscription Terms',
    uses: 50,
  },
  {
    name: 'Non-Mid-Market non-EMEA non-annual billing (new) requires VP of Sales',
    condition: { field: 'Billing Frequency', operator: 'is not', value: 'Annual Upfront' },
    approvers: ['VP of Sales'],
    scope: { segments: ['Non-Mid-Market'], regions: ['Non-EMEA'], dealTypes: ['New Customer'] },
    category: 'Billing Frequency',
    uses: 22,
  },
  {
    name: 'EMEA non-annual billing for existing customer requires VP of Sales (EMEA)',
    condition: { field: 'Billing Frequency', operator: 'is not', value: 'Annual Upfront' },
    approvers: ['VP of Sales (EMEA)'],
    scope: { segments: ['Non-Mid-Market'], regions: ['EMEA'], dealTypes: ['Existing Customer'] },
    category: 'Billing Frequency',
    uses: 19,
  },
  {
    name: 'Special products (Vault, Credits) require Deal Desk',
    condition: { field: 'Product', operator: 'is one of', value: 'Vault as Add-on, Yearly Credit, One-time Credit' },
    approvers: ['Deal Desk'],
    scope: {},
    category: 'Products',
    uses: 33,
  },
];

const CATEGORIES: TemplateCategory[] = [
  'All', 'Product Discounts', 'Products', 'Billing Frequency', 'Payment Terms', 'Subscription Terms',
];

// ---------------------------------------------------------------------------
// Palette data for builder
// ---------------------------------------------------------------------------

type PaletteCondition = { field: string; operator: string; value: string };

const DEFAULT_CONDITIONS: PaletteCondition[] = [
  { field: 'Billing Frequency', operator: 'is not', value: 'Annual Upfront' },
  { field: 'Billing Frequency', operator: 'is one of', value: 'Quarterly, Other' },
  { field: 'Billing Frequency', operator: 'equals', value: 'Other' },
  { field: 'Payment Terms', operator: 'is not', value: 'Net 30' },
  { field: 'Price Protection', operator: 'equals', value: 'Enabled' },
  { field: 'Price Lock', operator: 'equals', value: 'Enabled' },
  { field: 'Product Type', operator: 'equals', value: 'Custom Product' },
  { field: 'Product', operator: 'includes', value: 'API' },
  { field: 'Subscription Term', operator: 'outside', value: '12–24 months' },
  { field: 'Discount', operator: '>', value: '20%' },
];

const CONDITION_FIELDS = [
  'Billing Frequency', 'Payment Terms', 'Price Protection', 'Price Lock',
  'Product Type', 'Product', 'Subscription Term', 'Discount',
  'Contract Length', 'Revenue', 'Deal Size', 'Region',
];

const CONDITION_OPERATORS = [
  'equals', 'is not', 'is one of', 'includes', 'outside', '>', '<', '>=', '<=',
];

const DEFAULT_APPROVERS = [
  'Deal Desk', 'Deal Ops', 'VP of Sales', 'VP of Sales (EMEA)',
  'Head of Mid-Market', 'Finance', 'Legal', 'CFO',
];

const SCOPE_CATEGORIES: { label: string; items: string[] }[] = [
  { label: 'Segment', items: ['Enterprise', 'Mid-Market', 'SMB'] },
  { label: 'Region', items: ['EMEA', 'US'] },
  { label: 'Market', items: ['Developed', 'Developing'] },
  { label: 'Customer Type', items: ['New Customer', 'Existing Customer'] },
  { label: 'Deal Type', items: ['Expansion'] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function conditionLabel(c: { field: string; operator: string; value: string }) {
  return `${c.field} ${c.operator} ${c.value}`;
}

function conditionKey(c: { field: string; operator: string; value: string }) {
  return `${c.field}|${c.operator}|${c.value}`;
}

function scopeItems(scope: TemplateBlock['scope']): string[] {
  return [...(scope.segments ?? []), ...(scope.regions ?? []), ...(scope.dealTypes ?? [])];
}

function categoryStyle(cat: string) {
  switch (cat) {
    case 'Billing Frequency': return 'bg-[#5d7f8e]/10 text-[#5d7f8e]';
    case 'Payment Terms': return 'bg-[#8a7a68]/10 text-[#8a7a68]';
    case 'Product Discounts': return 'bg-[#5a7d63]/10 text-[#5a7d63]';
    case 'Products': return 'bg-[#1a1a1a]/[0.06] text-[#555]';
    case 'Subscription Terms': return 'bg-[#1a1a1a]/[0.06] text-[#555]';
    default: return 'bg-[#f0efe9] text-[#666]';
  }
}

// ---------------------------------------------------------------------------
// Builder View
// ---------------------------------------------------------------------------

interface CanvasState {
  conditions: { field: string; operator: string; value: string }[];
  approvers: string[];
  scopes: string[];
}

function BuilderView({
  templates,
  onSaveTrigger,
}: {
  templates: TemplateBlock[];
  onSaveTrigger: (canvas: CanvasState) => void;
}) {
  const [canvas, setCanvas] = useState<CanvasState>({ conditions: [], approvers: [], scopes: [] });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    conditions: true, approvers: true, scopes: true,
  });

  const [paletteConditions, setPaletteConditions] = useState<PaletteCondition[]>(DEFAULT_CONDITIONS);
  const [paletteApprovers, setPaletteApprovers] = useState<string[]>(DEFAULT_APPROVERS);
  const [scopeCategories, setScopeCategories] = useState(SCOPE_CATEGORIES.map(c => ({ ...c, items: [...c.items] })));

  const [showAddCondition, setShowAddCondition] = useState(false);
  const [newCondition, setNewCondition] = useState<PaletteCondition>({ field: CONDITION_FIELDS[0], operator: CONDITION_OPERATORS[0], value: '' });
  const [showAddApprover, setShowAddApprover] = useState(false);
  const [newApprover, setNewApprover] = useState('');
  const [addingScopeTo, setAddingScopeTo] = useState<string | null>(null);
  const [newScopeItem, setNewScopeItem] = useState('');

  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const addCondition = (c: PaletteCondition) => {
    if (canvas.conditions.some(x => conditionKey(x) === conditionKey(c))) return;
    setCanvas(prev => ({ ...prev, conditions: [...prev.conditions, c] }));
  };
  const removeCondition = (idx: number) =>
    setCanvas(prev => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== idx) }));

  const removePaletteCondition = (idx: number) => {
    const removed = paletteConditions[idx];
    setPaletteConditions(prev => prev.filter((_, i) => i !== idx));
    setCanvas(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => conditionKey(c) !== conditionKey(removed)),
    }));
  };

  const handleAddCondition = () => {
    if (!newCondition.value.trim()) return;
    if (paletteConditions.some(c => conditionKey(c) === conditionKey(newCondition))) {
      toast.error('This condition already exists');
      return;
    }
    setPaletteConditions(prev => [...prev, { ...newCondition, value: newCondition.value.trim() }]);
    setNewCondition({ field: CONDITION_FIELDS[0], operator: CONDITION_OPERATORS[0], value: '' });
    setShowAddCondition(false);
    toast.success('Condition added to palette');
  };

  const addApprover = (a: string) => {
    if (canvas.approvers.includes(a)) return;
    setCanvas(prev => ({ ...prev, approvers: [...prev.approvers, a] }));
  };
  const removeApprover = (idx: number) =>
    setCanvas(prev => ({ ...prev, approvers: prev.approvers.filter((_, i) => i !== idx) }));

  const removePaletteApprover = (idx: number) => {
    const removed = paletteApprovers[idx];
    setPaletteApprovers(prev => prev.filter((_, i) => i !== idx));
    setCanvas(prev => ({
      ...prev,
      approvers: prev.approvers.filter(a => a !== removed),
    }));
  };

  const handleAddApprover = () => {
    const name = newApprover.trim();
    if (!name) return;
    if (paletteApprovers.some(a => a.toLowerCase() === name.toLowerCase())) {
      toast.error('This approver already exists');
      return;
    }
    setPaletteApprovers(prev => [...prev, name]);
    setNewApprover('');
    setShowAddApprover(false);
    toast.success('Approver added to palette');
  };

  const handleAddScopeItem = (catLabel: string) => {
    const name = newScopeItem.trim();
    if (!name) return;
    setScopeCategories(prev => prev.map(cat => {
      if (cat.label !== catLabel) return cat;
      if (cat.items.some(i => i.toLowerCase() === name.toLowerCase())) return cat;
      return { ...cat, items: [...cat.items, name] };
    }));
    setNewScopeItem('');
    setAddingScopeTo(null);
    toast.success(`Added "${name}" to ${catLabel}`);
  };

  const removeScopeCategoryItem = (catLabel: string, item: string) => {
    setScopeCategories(prev => prev.map(cat => {
      if (cat.label !== catLabel) return cat;
      return { ...cat, items: cat.items.filter(i => i !== item) };
    }));
    setCanvas(prev => ({
      ...prev,
      scopes: prev.scopes.filter(s => s !== item),
    }));
  };

  const addScope = (s: string) => {
    if (canvas.scopes.includes(s)) return;
    setCanvas(prev => ({ ...prev, scopes: [...prev.scopes, s] }));
  };
  const removeScope = (idx: number) =>
    setCanvas(prev => ({ ...prev, scopes: prev.scopes.filter((_, i) => i !== idx) }));

  const clearCanvas = () => setCanvas({ conditions: [], approvers: [], scopes: [] });

  const loadTemplate = (t: TemplateBlock) => {
    setCanvas({
      conditions: [t.condition],
      approvers: [...t.approvers],
      scopes: scopeItems(t.scope),
    });
  };

  const canSave = canvas.conditions.length > 0 && canvas.approvers.length > 0;

  const matchedTriggers: MatchedTrigger[] = useMemo(() => {
    if (canvas.conditions.length === 0) return [];
    return matchTriggersByConditions(canvas.conditions, getAllTriggers());
  }, [canvas.conditions]);

  const exactConflicts = matchedTriggers.filter(m => m.matchLevel === 'exact');
  const [relatedTriggersOpen, setRelatedTriggersOpen] = useState(true);

  const scopeConflicts = useMemo(() => {
    if (canvas.scopes.length === 0 || exactConflicts.length === 0) return [];
    return exactConflicts.filter(m =>
      m.trigger.scope.some(s =>
        s === 'All segments' || canvas.scopes.some(cs => cs.toLowerCase() === s.toLowerCase())
      )
    );
  }, [exactConflicts, canvas.scopes]);

  const isConditionActive = (c: PaletteCondition) =>
    canvas.conditions.some(x => conditionKey(x) === conditionKey(c));
  const isApproverActive = (a: string) => canvas.approvers.includes(a);
  const isScopeActive = (sc: string) => canvas.scopes.includes(sc);

  const totalItems = canvas.conditions.length + canvas.approvers.length + canvas.scopes.length;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ── Left panel: Rule Components ── */}
      <aside className="w-[280px] flex-shrink-0 border-r border-[#e2e0d8] bg-[#f9fafb] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-[10px] font-bold text-[#999891] uppercase tracking-[0.08em] mb-4">Rule Components</h2>

          {/* ── Conditions ── */}
          <PaletteSection
            title="Conditions"
            icon={<Zap className="w-3 h-3" />}
            colorClass="text-[#5d7f8e]"
            count={paletteConditions.length}
            open={expandedSections.conditions}
            onToggle={() => toggleSection('conditions')}
          >
            <div className="flex flex-col gap-0.5">
              {paletteConditions.map((c, i) => {
                const active = isConditionActive(c);
                return (
                  <div key={i} className="group flex items-center">
                    <button
                      onClick={() => addCondition(c)}
                      className={`flex-1 text-left px-2.5 py-1.5 text-[11px] border-l-2 transition-colors ${
                        active
                          ? 'border-l-[#5d7f8e] bg-[#f0f4f6]'
                          : 'border-l-transparent hover:bg-[#f0efe9]'
                      }`}
                    >
                      <span className="font-semibold text-[#1a1a1a]">{c.field}</span>{' '}
                      <span className="font-mono text-[10px] text-[#888]">{c.operator}</span>{' '}
                      <span className="font-mono text-[10px] text-[#1a1a1a]">{c.value}</span>
                    </button>
                    {!active && (
                      <button
                        onClick={() => removePaletteCondition(i)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#ccc] hover:text-red-500 transition-colors flex-shrink-0"
                        title="Remove from palette"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {showAddCondition ? (
                <div className="mt-1.5 p-2.5 border border-[#e2e0d8] rounded-lg bg-white space-y-1.5">
                  <select
                    value={newCondition.field}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, field: e.target.value }))}
                    className="w-full h-7 pl-2 pr-5 border border-[#e2e0d8] rounded-md text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#5d7f8e]/40 appearance-none font-mono"
                  >
                    {CONDITION_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select
                    value={newCondition.operator}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.target.value }))}
                    className="w-full h-7 pl-2 pr-5 border border-[#e2e0d8] rounded-md text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#5d7f8e]/40 appearance-none font-mono"
                  >
                    {CONDITION_OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input
                    type="text"
                    value={newCondition.value}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCondition()}
                    placeholder="Value…"
                    className="w-full h-7 px-2 border border-[#e2e0d8] rounded-md text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#5d7f8e]/40 placeholder:text-[#bbb] font-mono"
                    autoFocus
                  />
                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      onClick={handleAddCondition}
                      disabled={!newCondition.value.trim()}
                      className="flex-1 h-7 rounded-md bg-[#1a1a1a] text-white text-[11px] font-medium disabled:opacity-40 hover:bg-[#333] transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddCondition(false); setNewCondition({ field: CONDITION_FIELDS[0], operator: CONDITION_OPERATORS[0], value: '' }); }}
                      className="h-7 px-3 rounded-md border border-[#e2e0d8] text-[11px] text-[#666] hover:bg-[#f5f6f8] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCondition(true)}
                  className="mt-1 text-[11px] text-[#999891] hover:text-[#1a1a1a] inline-flex items-center gap-1 transition-colors py-1 px-2.5"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
          </PaletteSection>

          {/* ── Approvers ── */}
          <PaletteSection
            title="Approvers"
            icon={<Users className="w-3 h-3" />}
            colorClass="text-[#5a7d63]"
            count={paletteApprovers.length}
            open={expandedSections.approvers}
            onToggle={() => toggleSection('approvers')}
          >
            <div className="flex flex-wrap gap-1.5">
              {paletteApprovers.map((a, i) => {
                const active = isApproverActive(a);
                return (
                  <span key={a} className="group relative inline-flex items-center">
                    <button
                      onClick={() => addApprover(a)}
                      className={`px-2.5 py-1 text-[11px] font-medium border rounded-md transition-colors ${
                        active
                          ? 'border-[#5a7d63] bg-[#f0f5f1] text-[#1a1a1a]'
                          : 'border-[#e2e0d8] bg-white text-[#333] hover:border-[#999]'
                      } ${!active ? 'pr-5' : ''}`}
                    >
                      {a}
                    </button>
                    {!active && (
                      <button
                        onClick={() => removePaletteApprover(i)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 text-[#ccc] hover:text-red-500 transition-colors"
                        title="Remove from palette"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    )}
                  </span>
                );
              })}

              {showAddApprover ? (
                <div className="w-full mt-1 flex gap-1.5">
                  <input
                    type="text"
                    value={newApprover}
                    onChange={(e) => setNewApprover(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddApprover();
                      if (e.key === 'Escape') { setShowAddApprover(false); setNewApprover(''); }
                    }}
                    placeholder="Approver name…"
                    className="flex-1 h-7 px-2 border border-[#e2e0d8] rounded-md text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#5a7d63]/40 placeholder:text-[#bbb]"
                    autoFocus
                  />
                  <button
                    onClick={handleAddApprover}
                    disabled={!newApprover.trim()}
                    className="h-7 px-3 rounded-md bg-[#1a1a1a] text-white text-[11px] font-medium disabled:opacity-40 hover:bg-[#333] transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowAddApprover(false); setNewApprover(''); }}
                    className="h-7 px-2 rounded-md border border-[#e2e0d8] text-[#666] hover:bg-[#f5f6f8] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddApprover(true)}
                  className="px-2.5 py-1 text-[11px] text-[#999891] border border-dashed border-[#d1d0c9] rounded-md hover:border-[#999] hover:text-[#1a1a1a] inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
          </PaletteSection>

          {/* ── Scopes ── */}
          <PaletteSection
            title="Scopes"
            icon={<Target className="w-3 h-3" />}
            colorClass="text-[#8a7a68]"
            count={scopeCategories.reduce((n, c) => n + c.items.length, 0)}
            open={expandedSections.scopes}
            onToggle={() => toggleSection('scopes')}
          >
            <div className="flex flex-col gap-2.5">
              {scopeCategories.map(cat => {
                const activeInCat = cat.items.filter(isScopeActive);
                return (
                  <div key={cat.label}>
                    <div className="relative">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) addScope(e.target.value);
                        }}
                        className={`w-full h-7 pl-2 pr-7 text-[11px] font-medium border rounded-md appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#8a7a68]/40 ${
                          activeInCat.length > 0
                            ? 'bg-[#f8f7f5] border-[#8a7a68] text-[#1a1a1a]'
                            : 'bg-white border-[#e2e0d8] text-[#666] hover:border-[#999]'
                        }`}
                      >
                        <option value="">
                          {cat.label}{activeInCat.length > 0 ? ` (${activeInCat.length})` : ''}
                        </option>
                        {cat.items.map(item => (
                          <option key={item} value={item} disabled={isScopeActive(item)}>
                            {isScopeActive(item) ? `✓ ${item}` : item}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#999891]" />
                    </div>
                    {activeInCat.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeInCat.map(item => (
                          <span
                            key={item}
                            className="group/tag inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-[10px] font-medium bg-[#f8f7f5] border border-[#8a7a68] rounded text-[#1a1a1a]"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => {
                                const idx = canvas.scopes.indexOf(item);
                                if (idx >= 0) removeScope(idx);
                              }}
                              className="p-0.5 rounded hover:bg-[#e2e0d8] transition-colors"
                              title="Remove from rule"
                            >
                              <X className="w-2 h-2" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeScopeCategoryItem(cat.label, item)}
                              className="p-0.5 rounded opacity-0 group-hover/tag:opacity-100 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                              title="Delete from palette"
                            >
                              <Trash2 className="w-2 h-2" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {addingScopeTo === cat.label ? (
                      <div className="flex gap-1 mt-1">
                        <input
                          type="text"
                          value={newScopeItem}
                          onChange={(e) => setNewScopeItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddScopeItem(cat.label);
                            if (e.key === 'Escape') { setAddingScopeTo(null); setNewScopeItem(''); }
                          }}
                          placeholder={`New ${cat.label.toLowerCase()}…`}
                          className="flex-1 h-6 px-2 border border-[#e2e0d8] rounded-md text-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#8a7a68]/40 placeholder:text-[#bbb]"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddScopeItem(cat.label)}
                          disabled={!newScopeItem.trim()}
                          className="h-6 px-2 rounded-md bg-[#1a1a1a] text-white text-[10px] font-medium disabled:opacity-40 hover:bg-[#333] transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingScopeTo(null); setNewScopeItem(''); }}
                          className="h-6 px-1.5 rounded-md border border-[#e2e0d8] text-[#666] hover:bg-[#f5f6f8] transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingScopeTo(cat.label); setNewScopeItem(''); }}
                        className="mt-1 text-[10px] text-[#999891] hover:text-[#1a1a1a] inline-flex items-center gap-0.5 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        Add to {cat.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </PaletteSection>
        </div>
      </aside>

      {/* ── Right canvas: Rule Definition ── */}
      <div className="flex-1 overflow-y-auto bg-[#f7f7f5]">
        <div className="p-6 max-w-2xl mx-auto">
          {/* Canvas header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Rule Definition</h2>
              {totalItems > 0 && (
                <span className="text-[11px] font-mono text-[#999891] bg-[#f0efe9] px-2 py-0.5 rounded-md border border-[#e2e0d8]">
                  {canvas.conditions.length} condition{canvas.conditions.length !== 1 ? 's' : ''}
                  {canvas.approvers.length > 0 && `, ${canvas.approvers.length} approver${canvas.approvers.length !== 1 ? 's' : ''}`}
                  {canvas.scopes.length > 0 && `, ${canvas.scopes.length} scope${canvas.scopes.length !== 1 ? 's' : ''}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {totalItems > 0 && (
                <button
                  onClick={clearCanvas}
                  className="h-7 px-2.5 rounded-md border border-[#e2e0d8] text-[11px] font-medium text-[#666] hover:text-[#333] hover:border-[#999] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
              {canSave && (
                <button
                  onClick={() => onSaveTrigger(canvas)}
                  className={`h-7 px-3 rounded-md text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                    exactConflicts.length > 0
                      ? 'bg-amber-600 text-white hover:bg-amber-700 border border-amber-700'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#333]'
                  }`}
                >
                  {exactConflicts.length > 0 ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Shield className="w-3 h-3" />
                  )}
                  Save as Trigger{exactConflicts.length > 0 ? ` (${exactConflicts.length} conflict${exactConflicts.length > 1 ? 's' : ''})` : ''}
                </button>
              )}
            </div>
          </div>

          {/* ── Rule sections ── */}
          <div className="flex flex-col gap-0">
            {/* 1. CONDITIONS */}
            <RuleSection
              step={1}
              label="CONDITIONS"
              accent={BLOCK_COLORS.when.accent}
              count={canvas.conditions.length}
              badge={exactConflicts.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-200 text-amber-700 text-[10px] font-semibold" title={`${exactConflicts.length} existing trigger${exactConflicts.length > 1 ? 's' : ''} share${exactConflicts.length === 1 ? 's' : ''} this exact condition`}>
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {exactConflicts.length} conflict{exactConflicts.length > 1 ? 's' : ''}
                </span>
              ) : matchedTriggers.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-semibold">
                  <Info className="w-2.5 h-2.5" />
                  {matchedTriggers.length} related
                </span>
              ) : undefined}
              empty={canvas.conditions.length === 0}
              emptyText="No conditions defined — click items from Rule Components panel"
            >
              <div className="flex flex-col">
                {canvas.conditions.map((c, i) => (
                  <div key={i} className="flex items-center px-3 py-2 border-b border-[#f0efe9] last:border-b-0 hover:bg-[#f9fafb] transition-colors">
                    <span className="flex-1 text-[12px]">
                      <span className="font-semibold text-[#1a1a1a]">{c.field}</span>{' '}
                      <span className="font-mono text-[11px] text-[#888]">{c.operator}</span>{' '}
                      <span className="font-mono text-[11px] text-[#1a1a1a]">{c.value}</span>
                    </span>
                    <button onClick={() => removeCondition(i)} className="p-1 text-[#ccc] hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </RuleSection>

            {/* 2. APPROVERS */}
            <RuleSection
              step={2}
              label="APPROVERS"
              accent={BLOCK_COLORS.then.accent}
              count={canvas.approvers.length}
              empty={canvas.approvers.length === 0}
              emptyText="No approvers defined — click items from Rule Components panel"
            >
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {canvas.approvers.map((a, i) => (
                    <div key={a} className="flex items-center gap-1.5">
                      {i > 0 && <ArrowRight className="w-3 h-3 text-[#ccc] flex-shrink-0" />}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#e2e0d8] bg-white text-[12px] font-medium text-[#1a1a1a]">
                        {a}
                        <button onClick={() => removeApprover(i)} className="p-0.5 rounded text-[#ccc] hover:text-red-500 transition-colors">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </RuleSection>

            {/* 3. SCOPE */}
            <RuleSection
              step={3}
              label="SCOPE"
              sublabel="optional"
              accent={BLOCK_COLORS.scope.accent}
              count={canvas.scopes.length}
              empty={canvas.scopes.length === 0}
              emptyText="No scope restrictions defined"
            >
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {canvas.scopes.map((sc, i) => (
                    <span key={sc} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#e2e0d8] bg-white text-[12px] font-medium text-[#1a1a1a]">
                      {sc}
                      <button onClick={() => removeScope(i)} className="p-0.5 rounded text-[#ccc] hover:text-red-500 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </RuleSection>
          </div>

          {/* ── Related triggers panel ── */}
          {matchedTriggers.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setRelatedTriggersOpen(prev => !prev)}
                className="w-full flex items-center gap-2 py-2 text-left"
              >
                <span className={`w-5 h-5 flex items-center justify-center ${exactConflicts.length > 0 ? 'text-amber-600' : 'text-blue-500'}`}>
                  {exactConflicts.length > 0 ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <Layers className="w-3.5 h-3.5" />
                  )}
                </span>
                <span className="text-[12px] font-semibold text-[#1a1a1a] flex-1">
                  Related Triggers
                  <span className="ml-1.5 font-mono text-[10px] font-normal text-[#999891]">
                    {matchedTriggers.length}
                  </span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#999891] transition-transform duration-200 ${relatedTriggersOpen ? '' : '-rotate-90'}`} />
              </button>

              {relatedTriggersOpen && (
                <div className="flex flex-col mt-1">
                  {scopeConflicts.length > 0 && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        <span className="font-semibold">{scopeConflicts.length === 1 ? 'A trigger' : `${scopeConflicts.length} triggers`} with identical conditions already exist{scopeConflicts.length === 1 ? 's' : ''} for overlapping scope.</span>{' '}
                        Saving may create a duplicate approval requirement.
                      </p>
                    </div>
                  )}

                  <div className="border border-[#e2e0d8] rounded-lg overflow-hidden divide-y divide-[#f0efe9]">
                    {matchedTriggers.map((m) => {
                      const isExact = m.matchLevel === 'exact';
                      return (
                        <div
                          key={m.trigger.id}
                          className={`px-3 py-2.5 transition-colors ${
                            isExact ? 'bg-amber-50/60' : 'bg-white hover:bg-[#f9fafb]'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-semibold text-[#1a1a1a] truncate">{m.trigger.name}</span>
                                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                                  m.trigger.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                  {m.trigger.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[10px] font-mono text-[#666]">
                                <span>{m.trigger.when}</span>
                                <span className="text-[#ccc]">|</span>
                                <span>{m.trigger.then.join(' \u2192 ')}</span>
                                {m.trigger.scope.length > 0 && (
                                  <>
                                    <span className="text-[#ccc]">|</span>
                                    <span>{m.trigger.scope.join(', ')}</span>
                                  </>
                                )}
                              </div>

                              <div className="mt-1.5 flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                  isExact
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                  {isExact ? 'Exact match' : `Same field: ${m.matchedField}`}
                                </span>
                                <span className="text-[10px] text-[#999891] font-mono">
                                  {m.trigger.impact.deals} deals · {m.trigger.impact.avgTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Starter Templates ── */}
          <div className="mt-6">
            <h3 className="text-[10px] font-bold text-[#999891] uppercase tracking-[0.08em] mb-2">Starter Templates</h3>
            <div className="border border-[#e2e0d8] rounded-lg overflow-hidden divide-y divide-[#f0efe9] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {templates.slice(0, 8).map((tmpl, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-[#f9fafb] transition-colors group"
                >
                  <span className="text-[11px] font-semibold text-[#1a1a1a] flex-1 truncate leading-snug">{tmpl.name}</span>
                  <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${categoryStyle(tmpl.category)}`}>
                    {tmpl.category}
                  </span>
                  <span className="flex-shrink-0 text-[10px] font-mono text-[#999891] w-8 text-right tabular-nums">{tmpl.uses}x</span>
                  <button
                    onClick={() => loadTemplate(tmpl)}
                    className="flex-shrink-0 h-6 px-2.5 rounded-md border border-[#e2e0d8] text-[10px] font-medium text-[#666] hover:text-[#1a1a1a] hover:border-[#999] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function PaletteSection({
  title, icon, colorClass, count, open, onToggle, children,
}: {
  title: string; icon: React.ReactNode; colorClass: string; count: number;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 py-1.5 text-left"
      >
        <span className={colorClass}>{icon}</span>
        <span className="text-[12px] font-semibold text-[#1a1a1a] flex-1">{title}</span>
        <span className="text-[10px] font-mono text-[#bbb]">{count}</span>
        <ChevronDown className={`w-3 h-3 text-[#999891] transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

function RuleSection({
  step, label, sublabel, accent, count, badge, empty, emptyText, children,
}: {
  step: number; label: string; sublabel?: string; accent: string;
  count: number; badge?: React.ReactNode; empty: boolean; emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#e2e0d8] rounded-lg overflow-hidden bg-white" style={{ borderLeftWidth: '3px', borderLeftColor: accent }}>
      {/* Section header bar */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-[#f9fafb] border-b border-[#e2e0d8]">
        <span
          className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: accent }}
        >
          {step}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1a1a1a]">{label}</span>
        {sublabel && <span className="text-[10px] text-[#bbb]">({sublabel})</span>}
        <span className="ml-auto flex items-center gap-2">
          {badge}
          <span className="text-[10px] font-mono text-[#bbb]">{count} added</span>
        </span>
      </div>
      {/* Section body */}
      {empty ? (
        <div className="py-5 flex items-center justify-center">
          <span className="text-[11px] text-[#bbb]">{emptyText}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table View (was Block Cards)
// ---------------------------------------------------------------------------

function TableView({
  templates,
  onUseTemplate,
}: {
  templates: TemplateBlock[];
  onUseTemplate: (name: string) => void;
}) {
  if (templates.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-[#f0efe9] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-[#d1d5db]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">No templates found</h3>
            <p className="text-[12px] text-[#999891]">Try a different search or filter</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-[#e2e0d8] bg-[#f9fafb]">
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666]">Name</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666]">Condition</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666]">Approvers</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666]">Scope</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666]">Category</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666] text-right">Uses</th>
            <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#666666]"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f1f4]">
          {templates.map((tmpl, idx) => {
            const scopes = scopeItems(tmpl.scope);
            return (
              <tr key={idx} className="hover:bg-[#f9fafb] transition-colors group">
                <td className="px-4 py-2.5 max-w-[240px]">
                  <span className="text-[11px] font-semibold text-[#1a1a1a] line-clamp-2 leading-snug">{tmpl.name}</span>
                </td>
                <td className="px-4 py-2.5 max-w-[200px]">
                  <span className="text-[10px] font-mono text-[#1a1a1a]">
                    <span className="font-semibold">{tmpl.condition.field}</span>{' '}
                    <span className="text-[#888]">{tmpl.condition.operator}</span>{' '}
                    {tmpl.condition.value}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-[10px] font-mono text-[#1a1a1a]">
                    {tmpl.approvers.join(' \u2192 ')}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {scopes.length > 0 ? (
                    <span className="text-[10px] font-mono text-[#666]">{scopes.join(', ')}</span>
                  ) : (
                    <span className="text-[10px] text-[#ccc]">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${categoryStyle(tmpl.category)}`}>
                    {tmpl.category}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className="text-[11px] font-mono text-[#999891] tabular-nums">{tmpl.uses}</span>
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => onUseTemplate(tmpl.name)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#e2e0d8] text-[10px] font-medium text-[#666] hover:text-[#1a1a1a] hover:border-[#999] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Copy className="w-3 h-3" />
                    Use
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Templates component
// ---------------------------------------------------------------------------

export function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [usageFilter, setUsageFilter] = useState('');
  const [viewMode, setViewMode] = useState<'builder' | 'table'>('builder');

  const templateFilterCount = usageFilter ? 1 : 0;

  const uniqueCategories = useMemo(() => {
    const cats = new Set(TEMPLATES.map(t => t.category));
    return cats.size;
  }, []);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(tmpl => {
      if (activeCategory !== 'All' && tmpl.category !== activeCategory) return false;

      if (usageFilter === 'low' && tmpl.uses >= 30) return false;
      if (usageFilter === 'medium' && (tmpl.uses < 30 || tmpl.uses > 50)) return false;
      if (usageFilter === 'high' && tmpl.uses <= 50) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          tmpl.name, tmpl.category, conditionLabel(tmpl.condition),
          ...tmpl.approvers, ...scopeItems(tmpl.scope),
        ].join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [activeCategory, usageFilter, searchQuery]);

  const handleSaveTriggerFromBuilder = (canvas: CanvasState) => {
    const conditionText = canvas.conditions
      .map(c => `${c.field} ${c.operator} ${c.value}`)
      .join(' AND ');
    const triggerName = `${canvas.approvers[0]} — ${conditionText}`;

    const fieldLower = canvas.conditions[0]?.field.toLowerCase() ?? '';
    let category = 'custom';
    if (['discount', 'price protection', 'price lock', 'product type', 'product'].some(f => fieldLower.includes(f))) {
      category = 'pricing';
    } else if (['billing frequency', 'payment terms', 'subscription term', 'contract'].some(f => fieldLower.includes(f))) {
      category = 'terms';
    }

    saveTrigger({
      name: triggerName,
      when: conditionText,
      then: canvas.approvers,
      scope: canvas.scopes.length > 0 ? canvas.scopes : ['All segments'],
      status: 'active',
      category,
      impact: { deals: 0, avgTime: '—' },
    });

    toast.success(`Trigger "${triggerName}" created`, {
      description: "It's now live in Approval Triggers.",
    });
    navigate('/triggers');
  };

  const handleUseTemplate = () => {
    setShowCreateModal(true);
  };

  const handleTriggerSaved = () => {
    setShowCreateModal(false);
    navigate('/triggers');
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Approval Rule Templates</h1>
            <p className="text-[#999891] text-[11px] mt-0.5 font-mono">
              {TEMPLATES.length} templates across {uniqueCategories} categories
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
                aria-label="Search templates"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 px-2.5 border rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
                templateFilterCount > 0
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                  : 'border-[#e2e0d8] text-[#333333]'
              }`}
              aria-label="Filter templates"
              aria-expanded={showFilters}
            >
              <Filter className={`w-3.5 h-3.5 ${templateFilterCount > 0 ? 'text-[#1a1a1a]' : 'text-[#999891]'}`} />
              Filters
              {templateFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[10px] flex items-center justify-center">{templateFilterCount}</span>
              )}
            </button>
            <button
              onClick={() => toast.info('Add Template functionality coming soon')}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              aria-label="Add new template"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Template
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-0.5 border-b border-transparent -mb-[1px]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors border-b-2 ${
                activeCategory === cat
                  ? 'border-[#1a1a1a] text-[#1a1a1a]'
                  : 'border-transparent text-[#999891] hover:text-[#666]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Filter Bar */}
      {showFilters && (
        <div className="border-b border-[#e2e0d8] bg-[#f9fafb] px-6 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <TemplateFilterSelect
              label="Usage Level"
              value={usageFilter}
              options={[
                { value: 'low', label: 'Low (< 30)' },
                { value: 'medium', label: 'Medium (30-50)' },
                { value: 'high', label: 'High (> 50)' },
              ]}
              onChange={setUsageFilter}
            />
            {templateFilterCount > 0 && (
              <button
                onClick={() => setUsageFilter('')}
                className="h-7 px-2 text-[11px] text-[#999891] hover:text-[#333333] inline-flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── View toggle bar ── */}
      <div className="border-b border-[#e2e0d8] bg-white px-6 py-1.5 flex items-center justify-between">
        <span className="text-[11px] text-[#999891] font-mono">{filteredTemplates.length} result{filteredTemplates.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-0.5 bg-[#f0efe9] p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('builder')}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors inline-flex items-center gap-1.5 rounded-md ${
              viewMode === 'builder' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999891] hover:text-[#333333]'
            }`}
          >
            <ListFilter className="w-3 h-3" />
            Builder
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors inline-flex items-center gap-1.5 rounded-md ${
              viewMode === 'table' ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#999891] hover:text-[#333333]'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            Table
          </button>
        </div>
      </div>

      {/* Content area */}
      {viewMode === 'builder' ? (
        <BuilderView templates={filteredTemplates} onSaveTrigger={handleSaveTriggerFromBuilder} />
      ) : (
        <TableView templates={filteredTemplates} onUseTemplate={() => handleUseTemplate()} />
      )}

      {showCreateModal && (
        <CreateTriggerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleTriggerSaved}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared filter select
// ---------------------------------------------------------------------------

function TemplateFilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`h-7 pl-2 pr-6 border rounded-md text-[11px] font-medium transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
          value
            ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
            : 'bg-white text-[#666666] border-[#e2e0d8] hover:border-[#1a1a1a]/30'
        }`}
      >
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <svg className={`w-3 h-3 absolute right-1.5 pointer-events-none ${value ? 'text-white' : 'text-[#999891]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
