import { Plus, Search, Filter, X, Shield, Eye, Layers } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useLocation } from 'react-router';
import { CreateTriggerModal } from './CreateTriggerModal';
import { ViewTriggerModal } from './ViewTriggerModal';
import { ViewTriggerDrawer } from './ViewTriggerDrawer';
import { getSavedTriggers, deleteTrigger, StoredTrigger, HARDCODED_TRIGGERS } from './triggerStore';
import { toast } from 'sonner';

interface Trigger {
  id: number;
  name: string;
  when: string;
  then: string[];
  scope: string[];
  status: 'active' | 'paused';
  impact: { deals: number; avgTime: string };
  category: string;
  fromTemplate?: string;
  createdAt?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  pricing: "Product Discounts",
  terms: "Commercial Terms",
  custom: "Custom Triggers"
};

function triggerCategoryStyle(cat: string) {
  switch (cat) {
    case 'pricing': return 'bg-[#5d7f8e]/10 text-[#5d7f8e]';
    case 'terms': return 'bg-[#8a7a68]/10 text-[#8a7a68]';
    case 'custom': return 'bg-[#1a1a1a]/[0.06] text-[#555]';
    default: return 'bg-[#f0efe9] text-[#666]';
  }
}

function StyledCondition({ text }: { text: string }) {
  const operatorRegex = /(>=|<=|!=|≥|≤|≠|>|<|=)/g;
  const parts = text.split(operatorRegex);

  if (parts.length <= 1) return <>{text}</>;

  return (
    <>
      {parts.map((part, i) => {
        if (operatorRegex.test(part)) {
          operatorRegex.lastIndex = 0;
          const colorClass =
            part === '!=' || part === '≠'
              ? 'text-amber-600'
              : part === '=' 
                ? 'text-teal-600'
                : 'text-indigo-500';
          return (
            <span key={i} className={`${colorClass} font-semibold mx-0.5`}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function ApprovalTriggers() {
  const { category } = useParams();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  type DrawerState =
    | { type: 'closed' }
    | { type: 'view'; trigger: Trigger }
    | { type: 'edit'; trigger: Trigger };
  const [drawer, setDrawer] = useState<DrawerState>({ type: 'closed' });
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [savedTriggers, setSavedTriggers] = useState<StoredTrigger[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [scopeFilter, setScopeFilter] = useState<string>('');
  const [approverFilter, setApproverFilter] = useState<string>('');

  const loadSaved = useCallback(() => {
    setSavedTriggers(getSavedTriggers());
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleModalSave = () => {
    setShowCreateModal(false);
    loadSaved();
  };

  const triggers: Trigger[] = useMemo(() => [
    ...HARDCODED_TRIGGERS.map((ht) => ({ ...ht })),
    ...savedTriggers.map((st) => ({
      id: st.id,
      name: st.name,
      when: st.when,
      then: st.then,
      scope: st.scope,
      status: st.status,
      impact: st.impact,
      category: st.category,
      fromTemplate: st.fromTemplate,
      createdAt: st.createdAt,
    })),
  ], [savedTriggers]);

  useEffect(() => {
    const state = location.state as { filterGroup?: string } | null;
    if (state?.filterGroup) {
      setGroupFilter(state.filterGroup);
    }
  }, [location.state]);

  const categories = ['All', ...Object.values(CATEGORY_LABELS)];
  const uniqueCategories = new Set(triggers.map(t => t.category)).size;

  const triggerFilterCount = [statusFilter, scopeFilter, approverFilter].filter(Boolean).length;

  const allScopes = [...new Set(triggers.flatMap(t => t.scope))].sort();
  const allApprovers = [...new Set(triggers.flatMap(t => t.then))].sort();

  const clearTriggerFilters = () => {
    setStatusFilter('');
    setScopeFilter('');
    setApproverFilter('');
  };

  const filteredTriggers = useMemo(() => triggers.filter(trigger => {
    if (activeCategory !== 'All' && CATEGORY_LABELS[trigger.category] !== activeCategory) {
      return false;
    }

    if (category && trigger.category !== category) return false;

    if (statusFilter && trigger.status !== statusFilter) return false;
    if (scopeFilter && !trigger.scope.includes(scopeFilter)) return false;
    if (approverFilter && !trigger.then.includes(approverFilter)) return false;

    if (groupFilter) {
      const matchesGroup = trigger.then.some(approver =>
        approver.toLowerCase().includes(groupFilter.toLowerCase())
      );
      if (!matchesGroup) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        trigger.name.toLowerCase().includes(query) ||
        trigger.when.toLowerCase().includes(query) ||
        trigger.then.some(approver => approver.toLowerCase().includes(query)) ||
        trigger.scope.some(s => s.toLowerCase().includes(query)) ||
        (CATEGORY_LABELS[trigger.category] || '').toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  }), [triggers, activeCategory, category, statusFilter, scopeFilter, approverFilter, groupFilter, searchQuery]);

  const categorySummary = useMemo(() => {
    if (!category) return null;
    const deals = filteredTriggers.reduce((sum, t) => sum + t.impact.deals, 0);
    const avgTimes = filteredTriggers.map(t => parseFloat(t.impact.avgTime));
    const avgTime = avgTimes.length > 0 ? (avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length).toFixed(1) : '0';
    return {
      label: CATEGORY_LABELS[category] || category,
      count: filteredTriggers.length,
      deals,
      avgTime: `${avgTime}h`,
    };
  }, [category, filteredTriggers]);

  const handleTriggerClick = (trigger: Trigger) => {
    setDrawer({ type: 'view', trigger });
  };

  const handleViewToEdit = (trigger: Trigger) => {
    setDrawer({ type: 'edit', trigger });
  };

  const handleCloseDrawer = () => {
    setDrawer({ type: 'closed' });
  };

  const handleSaveTrigger = (updatedTrigger: Trigger) => {
    toast.success(`Trigger "${updatedTrigger.name}" updated successfully`);
    setDrawer({ type: 'closed' });
  };

  const handleDeleteTrigger = (triggerId: number) => {
    deleteTrigger(triggerId);
    loadSaved();
    toast.success('Trigger deleted successfully');
    setDrawer({ type: 'closed' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Approval Triggers</h1>
            <p className="text-[#999891] text-[11px] mt-0.5">
              {triggers.length} rules across {uniqueCategories} categories
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
                aria-label="Search triggers"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 px-2.5 border rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
                triggerFilterCount > 0
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                  : 'border-[#e2e0d8] text-[#333333]'
              }`}
              aria-label="Filter triggers"
              aria-expanded={showFilters}
            >
              <Filter className={`w-3.5 h-3.5 ${triggerFilterCount > 0 ? 'text-[#1a1a1a]' : 'text-[#999891]'}`} />
              Filters
              {triggerFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[10px] flex items-center justify-center">{triggerFilterCount}</span>
              )}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              aria-label="Add new trigger"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Trigger
            </button>
          </div>
        </div>

        {/* Category tabs */}
        {!category && (
          <div className="flex items-center gap-0.5 mt-2.5 border-b border-transparent -mb-[1px]">
            {categories.map((cat) => (
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
        )}
      </header>

      {/* Filter Bar */}
      {showFilters && (
        <div className="border-b border-[#e2e0d8] bg-[#f9fafb] px-6 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <TriggerFilterSelect label="Status" value={statusFilter} options={[{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }]} onChange={setStatusFilter} />
            <TriggerFilterSelect label="Scope" value={scopeFilter} options={allScopes.map(s => ({ value: s, label: s }))} onChange={setScopeFilter} />
            <TriggerFilterSelect label="Approver" value={approverFilter} options={allApprovers.map(a => ({ value: a, label: a }))} onChange={setApproverFilter} />
            {triggerFilterCount > 0 && (
              <button onClick={clearTriggerFilters} className="h-7 px-2 text-[11px] text-[#999891] hover:text-[#333333] inline-flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {groupFilter && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-[#999891]">
              Showing triggers for group: <span className="font-medium text-[#666]">{groupFilter}</span>
            </span>
            <button
              onClick={() => setGroupFilter(null)}
              className="text-[11px] text-[#999891] hover:text-[#333] inline-flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filter
            </button>
          </div>
        )}

        {filteredTriggers.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="text-center py-16">
              <Shield className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
              <p className="text-[13px] font-medium text-[#333333]">
                {searchQuery ? `No triggers found matching "${searchQuery}"` : 'No triggers found'}
              </p>
              <p className="text-[12px] text-[#999891] mt-0.5">
                {searchQuery ? 'Try a different search term' : 'Create your first trigger to get started'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {categorySummary && (
              <div className="mb-3 px-1">
                <span className="text-[12px] font-semibold text-[#1a1a1a]">{categorySummary.label}</span>
                <span className="text-[11px] text-[#999891] ml-3">
                  {categorySummary.count} trigger{categorySummary.count !== 1 ? 's' : ''}, {categorySummary.deals} deals impacted, avg {categorySummary.avgTime}
                </span>
              </div>
            )}

            <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Condition</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Approvers</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Scope</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Category</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Impact</th>
                      <th className="px-4 py-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f1f4]">
                    {filteredTriggers.map((trigger) => (
                      <tr
                        key={trigger.id}
                        onClick={() => handleTriggerClick(trigger)}
                        className="hover:bg-[#f9fafb] transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-2.5">
                          <ExpandCell className="text-[13px] font-medium text-[#1a1a1a]">
                            {trigger.name}
                          </ExpandCell>
                          {trigger.fromTemplate && (
                            <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] font-medium text-[#999891]">
                              <Layers className="w-2.5 h-2.5" />
                              Template
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <ExpandCell className="text-[13px] text-[#666666]">
                            <StyledCondition text={trigger.when} />
                          </ExpandCell>
                        </td>
                        <td className="px-4 py-2.5">
                          <ExpandCell className="text-[13px] text-[#666666]">
                            {trigger.then.join(' \u2192 ')}
                          </ExpandCell>
                        </td>
                        <td className="px-4 py-2.5">
                          <ExpandCell className="text-[13px] text-[#666666]">
                            {trigger.scope.length > 0 ? trigger.scope.join(', ') : '\u2014'}
                          </ExpandCell>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[11px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded whitespace-nowrap ${triggerCategoryStyle(trigger.category)}`}>
                            {CATEGORY_LABELS[trigger.category] || trigger.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
                            trigger.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            <span className={`w-1 h-1 rounded-full flex-shrink-0 ${trigger.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {trigger.status === 'active' ? 'Active' : 'Paused'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <span className="text-[13px] text-[#999891] tabular-nums">
                            {trigger.impact.deals} deals &middot; {trigger.impact.avgTime}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Eye className="w-3.5 h-3.5 text-[#ccc] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[11px] text-[#999891] mt-2 text-center">
              {filteredTriggers.length} result{filteredTriggers.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateTriggerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleModalSave}
        />
      )}

      {drawer.type === 'view' && (
        <ViewTriggerDrawer
          trigger={drawer.trigger}
          onClose={handleCloseDrawer}
          onEdit={handleViewToEdit}
          onDelete={handleDeleteTrigger}
        />
      )}

      {drawer.type === 'edit' && (
        <ViewTriggerModal
          trigger={drawer.trigger}
          onClose={handleCloseDrawer}
          onSave={handleSaveTrigger}
          onDelete={handleDeleteTrigger}
        />
      )}
    </div>
  );
}

function ExpandCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [children]);

  return (
    <span className="relative block group/cell">
      <span
        ref={textRef}
        className={`block truncate ${className}`}
      >
        {children}
      </span>
      {isTruncated && (
        <span className="absolute left-0 top-0 z-20 hidden group-hover/cell:block px-2.5 py-1.5 bg-[#1a1a1a] text-white text-[12px] rounded-md shadow-lg whitespace-nowrap max-w-[400px] -translate-y-[calc(100%+4px)]">
          {children}
        </span>
      )}
    </span>
  );
}

function TriggerFilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
