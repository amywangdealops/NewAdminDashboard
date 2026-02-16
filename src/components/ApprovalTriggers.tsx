import { Plus, Search, Filter, X, DollarSign, FileText, RefreshCw, Settings, Shield, Eye, Layers } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router';
import { CreateTriggerModal } from './CreateTriggerModal';
import { ViewTriggerModal } from './ViewTriggerModal';
import { getSavedTriggers, StoredTrigger } from './triggerStore';
import { toast } from 'sonner';

interface Trigger {
  id: number;
  name: string;
  icon: any;
  when: string;
  then: string[];
  scope: string[];
  status: 'active' | 'paused';
  impact: { deals: number; avgTime: string };
  category: string;
  fromTemplate?: string;
  createdAt?: string;
}

const ICON_MAP: Record<string, any> = {
  pricing: DollarSign,
  terms: FileText,
  custom: Settings,
};

const CATEGORY_LABELS: Record<string, string> = {
  pricing: "Product Discounts",
  terms: "Commercial Terms",
  custom: "Custom Triggers"
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  pricing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  terms: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  custom: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

export function ApprovalTriggers() {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [savedTriggers, setSavedTriggers] = useState<StoredTrigger[]>([]);

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

  const hardcodedTriggers: Trigger[] = [
    {
      id: 1,
      name: "High Discount Approval",
      icon: DollarSign,
      when: "Discount > 20%",
      then: ["Deal Desk", "VP of Sales"],
      scope: ["Enterprise", "US"],
      status: "active",
      impact: { deals: 234, avgTime: "2.3h" },
      category: "pricing"
    },
    {
      id: 2,
      name: "Extended Payment Terms",
      icon: FileText,
      when: "Payment Terms = Net 90",
      then: ["Finance", "Head of Sales"],
      scope: ["Enterprise", "EMEA"],
      status: "active",
      impact: { deals: 156, avgTime: "4.1h" },
      category: "terms"
    },
    {
      id: 3,
      name: "Auto-Renewal Disabled",
      icon: RefreshCw,
      when: "Auto-renewal = Off",
      then: ["Legal", "Customer Success"],
      scope: ["All segments"],
      status: "active",
      impact: { deals: 89, avgTime: "1.8h" },
      category: "terms"
    },
    {
      id: 4,
      name: "Custom Product Addition",
      icon: Settings,
      when: "Product type = Custom",
      then: ["Product Team", "Engineering"],
      scope: ["Enterprise"],
      status: "active",
      impact: { deals: 45, avgTime: "6.2h" },
      category: "custom"
    },
    {
      id: 5,
      name: "Large Deal Override",
      icon: DollarSign,
      when: "ACV > $500K",
      then: ["VP of Sales", "CFO"],
      scope: ["Enterprise", "Mid-Market"],
      status: "active",
      impact: { deals: 18, avgTime: "8.1h" },
      category: "pricing"
    },
    {
      id: 6,
      name: "Multi-Year Commitment",
      icon: FileText,
      when: "Contract length > 1 year",
      then: ["Deal Desk", "Finance"],
      scope: ["All segments"],
      status: "active",
      impact: { deals: 112, avgTime: "3.5h" },
      category: "terms"
    },
    {
      id: 7,
      name: "Non-Standard Billing",
      icon: FileText,
      when: "Billing Frequency ≠ Annual",
      then: ["Deal Desk"],
      scope: ["Mid-Market"],
      status: "paused",
      impact: { deals: 67, avgTime: "1.2h" },
      category: "terms"
    },
  ];

  const triggers: Trigger[] = [
    ...hardcodedTriggers,
    ...savedTriggers.map((st) => ({
      id: st.id,
      name: st.name,
      icon: ICON_MAP[st.category] || FileText,
      when: st.when,
      then: st.then,
      scope: st.scope,
      status: st.status,
      impact: st.impact,
      category: st.category,
      fromTemplate: st.fromTemplate,
      createdAt: st.createdAt,
    })),
  ];

  const getCategoryLabel = (cat?: string) => {
    return cat ? (CATEGORY_LABELS[cat] ?? cat) : "All Triggers";
  };

  useEffect(() => {
    const state = location.state as { filterGroup?: string } | null;
    if (state?.filterGroup) {
      setGroupFilter(state.filterGroup);
    }
  }, [location.state]);

  const categories = ['All', ...Object.values(CATEGORY_LABELS)];

  const filteredTriggers = triggers.filter(trigger => {
    if (activeCategory !== 'All' && CATEGORY_LABELS[trigger.category] !== activeCategory) {
      return false;
    }

    if (category && trigger.category !== category) return false;

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
  });


  const handleTriggerClick = (trigger: Trigger) => {
    setSelectedTrigger(trigger);
    setShowViewModal(true);
  };

  const handleSaveTrigger = (updatedTrigger: Trigger) => {
    toast.success(`Trigger "${updatedTrigger.name}" updated successfully`);
    setShowViewModal(false);
    setSelectedTrigger(null);
  };

  const handleDeleteTrigger = (triggerId: number) => {
    toast.success('Trigger deleted successfully');
    setShowViewModal(false);
    setSelectedTrigger(null);
  };

  const renderSentence = (trigger: Trigger) => {
    const approverChain = trigger.then.join(' → ');
    return `When ${trigger.when}, require approval from ${approverChain}`;
  };

  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Approval Triggers</h1>
            <p className="text-[#999891] text-[12px] mt-0.5">
              Rules that trigger internal approval before a deal can close
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
              onClick={() => setShowCreateModal(true)}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              aria-label="Add new trigger"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Trigger
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-[#1a1a1a] text-white shadow-sm'
                  : 'bg-[#f0efe9] text-[#666666] hover:bg-[#e2e0d8] hover:text-[#333333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {filteredTriggers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-[#f0efe9] flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-[#d1d5db]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">
              {searchQuery ? `No triggers found matching "${searchQuery}"` : 'No triggers found'}
            </h3>
            <p className="text-[12px] text-[#999891]">
              {searchQuery ? 'Try a different search term' : 'Create your first trigger to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredTriggers.map((trigger) => {
              const catColor = CATEGORY_COLORS[trigger.category] || CATEGORY_COLORS.custom;
              return (
                <div
                  key={trigger.id}
                  className="bg-white rounded-lg border border-[#e2e0d8] p-4 hover:shadow-[0_4px_16px_rgba(66,98,255,0.08)] hover:border-[#1a1a1a]/25 transition-all duration-200 flex flex-col"
                >
                  {/* Top row: icon + name + status */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-md bg-[#1a1a1a]/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <trigger.icon className="w-3.5 h-3.5 text-[#1a1a1a]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[#1a1a1a] text-[13px] leading-snug">{trigger.name}</h3>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          trigger.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${trigger.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {trigger.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#666666] leading-relaxed mt-0.5 line-clamp-2">{renderSentence(trigger)}</p>
                    </div>
                  </div>

                  {/* Tags row */}
                  <div className="mb-3 flex items-center gap-1.5 flex-wrap ml-[38px]">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                      trigger.category === 'pricing' ? 'bg-blue-50 text-blue-600' :
                      trigger.category === 'terms' ? 'bg-violet-50 text-violet-600' :
                      trigger.category === 'custom' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {CATEGORY_LABELS[trigger.category]}
                    </span>
                    {trigger.fromTemplate && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1a1a1a]/[0.06] text-[#1a1a1a] text-[10px] font-medium">
                        <Layers className="w-2.5 h-2.5" />
                        Template
                      </span>
                    )}
                    {trigger.createdAt && (
                      <span className="text-[10px] text-[#999891]">
                        {new Date(trigger.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Spacer to push footer down */}
                  <div className="flex-1" />

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0f1f4] ml-[38px]">
                    <div className="flex items-center gap-3 text-[11px] text-[#999891]">
                      <span className="tabular-nums">{trigger.impact.deals} deals</span>
                      <span className="tabular-nums">avg {trigger.impact.avgTime}</span>
                    </div>
                    <button
                      onClick={() => handleTriggerClick(trigger)}
                      className="px-2.5 py-1.5 border border-[#e2e0d8] rounded-md hover:bg-[#f9fafb] hover:border-[#1a1a1a]/25 flex items-center gap-1.5 text-[#333333] text-[11px] font-medium transition-all duration-150 active:scale-[0.98]"
                      aria-label={`View trigger: ${trigger.name}`}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
            </div>
              );
            })}
            </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTriggerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleModalSave}
        />
      )}

      {showViewModal && selectedTrigger && (
        <ViewTriggerModal
          trigger={selectedTrigger}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTrigger(null);
          }}
          onSave={handleSaveTrigger}
          onDelete={handleDeleteTrigger}
        />
      )}
    </div>
  );
}
