import { Plus, Search, Shield, Filter, ChevronRight, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { CreateTriggerModal } from './CreateTriggerModal';

export function ApprovalTriggers() {
  const { category } = useParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const triggers = [
    {
      id: 1,
      name: "High Discount Approval",
      icon: "💰",
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
      icon: "📄",
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
      icon: "🔁",
      when: "Auto-renewal = Off",
      then: ["Legal", "Customer Success"],
      scope: ["All segments"],
      status: "active",
      impact: { deals: 89, avgTime: "1.8h" },
      category: "subscriptions"
    },
    {
      id: 4,
      name: "Custom Product Addition",
      icon: "⚙️",
      when: "Product type = Custom",
      then: ["Product Team", "Engineering"],
      scope: ["Enterprise"],
      status: "active",
      impact: { deals: 45, avgTime: "6.2h" },
      category: "custom"
    },
  ];

  const getCategoryLabel = (cat?: string) => {
    const labels: Record<string, string> = {
      pricing: "Pricing & Discounts",
      terms: "Contract Terms",
      subscriptions: "Subscription Changes",
      custom: "Custom Triggers"
    };
    return cat ? labels[cat] : "All Triggers";
  };

  const filteredTriggers = category 
    ? triggers.filter(t => t.category === category)
    : triggers;

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <header className="border-b border-[#e1e4e8] px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-[#050038]">
                {getCategoryLabel(category)}
              </h1>
              <p className="text-[#6c757d] mt-1 text-sm">
                Approval triggers define when a deal needs sign-off. Reps never see this — it only controls internal approval flow.
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Approval Trigger
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" />
              <input
                type="text"
                placeholder="Search triggers by name, condition, or approver..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all"
              />
            </div>
            <button className="px-4 py-2.5 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] flex items-center gap-2 text-[#050038] text-sm font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </header>

        {/* Info Banner */}
        <div className="px-8 py-4 bg-[#f0f4ff] border-b border-[#d0e0ff]">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#4262FF]" />
            <div className="text-sm">
              <span className="font-medium text-[#050038]">Managing risk scenarios:</span>
              <span className="text-[#6c757d] ml-2">Each trigger below represents a scenario that requires approval. Click any card to see impact and edit conditions.</span>
            </div>
          </div>
        </div>

        {/* Trigger Cards */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTriggers.map((trigger) => (
              <div
                key={trigger.id}
                className="group bg-white rounded-lg border border-[#e1e4e8] p-5 hover:shadow-lg hover:border-[#4262FF]/30 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{trigger.icon}</div>
                    <div>
                      <h3 className="font-semibold text-[#050038] text-base mb-1">
                        {trigger.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] rounded-full text-xs font-medium">
                          {trigger.status}
                        </span>
                        {trigger.scope.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#f8f9fa] text-[#6c757d] rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 text-[#6c757d] hover:text-[#050038] transition-opacity">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Condition */}
                <div className="mb-4 p-3 bg-[#f8f9fa] rounded-md border border-[#e1e4e8]">
                  <div className="text-xs text-[#6c757d] mb-1">WHEN</div>
                  <div className="text-sm font-mono text-[#050038]">{trigger.when}</div>
                </div>

                {/* Approvers */}
                <div className="mb-4">
                  <div className="text-xs text-[#6c757d] mb-2">THEN REQUIRE APPROVAL FROM</div>
                  <div className="flex items-center gap-2">
                    {trigger.then.map((approver, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="px-3 py-1 bg-[#fff3e0] text-[#e65100] rounded-md text-xs font-medium">
                          {approver}
                        </span>
                        {idx < trigger.then.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-[#6c757d]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impact Stats */}
                <div className="flex items-center gap-4 pt-3 border-t border-[#e1e4e8]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6c757d]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{trigger.impact.deals} deals (30d)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#6c757d]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Avg {trigger.impact.avgTime}</span>
                  </div>
                  <button className="ml-auto text-xs text-[#4262FF] hover:underline font-medium">
                    View impact →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State for filtered view */}
          {filteredTriggers.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-[#e1e4e8] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#050038] mb-2">
                No triggers in this category yet
              </h3>
              <p className="text-[#6c757d] mb-6">
                Create your first {getCategoryLabel(category).toLowerCase()} trigger
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] font-medium text-sm transition-colors shadow-sm"
              >
                Create Trigger
              </button>
            </div>
          )}

          {/* Common Patterns Section */}
          {!category && (
            <div className="mt-8 p-6 bg-[#f8f9fa] rounded-lg border border-[#e1e4e8]">
              <h3 className="font-semibold text-[#050038] mb-3 text-sm">💡 Common Patterns</h3>
              <p className="text-sm text-[#6c757d] mb-4">
                Start with a pre-built trigger template and customize it for your needs
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 bg-white border border-[#e1e4e8] rounded-md hover:border-[#4262FF] hover:bg-[#f0f4ff] transition-all text-left">
                  <div className="text-sm font-medium text-[#050038] mb-1">
                    High discount requires Sales Manager
                  </div>
                  <div className="text-xs text-[#6c757d]">When discount &gt; threshold</div>
                </button>
                <button className="p-3 bg-white border border-[#e1e4e8] rounded-md hover:border-[#4262FF] hover:bg-[#f0f4ff] transition-all text-left">
                  <div className="text-sm font-medium text-[#050038] mb-1">
                    Extended payment terms require Finance
                  </div>
                  <div className="text-xs text-[#6c757d]">When payment terms &gt; Net 30</div>
                </button>
                <button className="p-3 bg-white border border-[#e1e4e8] rounded-md hover:border-[#4262FF] hover:bg-[#f0f4ff] transition-all text-left">
                  <div className="text-sm font-medium text-[#050038] mb-1">
                    Auto-renewal off requires Legal
                  </div>
                  <div className="text-xs text-[#6c757d]">When auto-renewal disabled</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Rail */}
      <aside className="w-80 bg-white border-l border-[#e1e4e8] p-6">
        <h3 className="font-semibold text-[#050038] mb-4">Quick Actions</h3>
        
        <div className="space-y-3 mb-6">
          <button className="w-full p-3 bg-[#f0f4ff] border border-[#4262FF]/20 rounded-md hover:bg-[#e0ecff] transition-colors text-left">
            <div className="text-sm font-medium text-[#4262FF] mb-1">🎯 Simulate a Deal</div>
            <div className="text-xs text-[#6c757d]">Test which approvals would fire</div>
          </button>
          
          <button className="w-full p-3 bg-[#f8f9fa] border border-[#e1e4e8] rounded-md hover:bg-white transition-colors text-left">
            <div className="text-sm font-medium text-[#050038] mb-1">📊 View All Impact</div>
            <div className="text-xs text-[#6c757d]">See trigger performance data</div>
          </button>
        </div>

        <div className="pt-6 border-t border-[#e1e4e8]">
          <h3 className="font-semibold text-[#050038] mb-3 text-sm">Need to Know</h3>
          <div className="space-y-3 text-sm text-[#6c757d]">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#4262FF] mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-[#050038] text-xs mb-1">What is this?</div>
                <div className="text-xs">Triggers control when deals need internal approval before closing</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#4262FF] mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-[#050038] text-xs mb-1">When do I use it?</div>
                <div className="text-xs">Create triggers for any deal scenario that represents risk or requires oversight</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#4262FF] mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-[#050038] text-xs mb-1">What happens if I change it?</div>
                <div className="text-xs">Changes apply to new deals immediately. Existing approvals in progress are not affected</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Create Trigger Modal */}
      {showCreateModal && (
        <CreateTriggerModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}