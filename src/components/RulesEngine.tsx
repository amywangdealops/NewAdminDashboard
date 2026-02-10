import { Plus, Search, Zap, Filter, Code } from 'lucide-react';

export function RulesEngine() {
  const rules = [
    { name: "Billing Frequency → Deal Desk (Expansion, Mid-Market)", type: "Term Rule", conditions: 3, approvals: 1, status: "Active", visibility: "Full" },
    { name: "Deal Desk → API (per user)", type: "Discount", conditions: 2, approvals: 1, status: "Active", visibility: "Full" },
    { name: "Price Lock Term Rule → Deal Desk", type: "Term Rule", conditions: 2, approvals: 1, status: "Active", visibility: "Partial" },
    { name: "Payment Terms → Deal Desk", type: "Term Rule", conditions: 4, approvals: 2, status: "Active", visibility: "Full" },
    { name: "Billing Frequency → VP of Sales (non-Mid-Market)", type: "Term Rule", conditions: 3, approvals: 1, status: "Active", visibility: "Code Only" },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-[#e1e4e8] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#050038]">Business Rules</h1>
            <p className="text-[#6c757d] mt-1 text-sm">Set discount limits and term conditions that trigger approvals</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Create Rule
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" />
            <input
              type="text"
              placeholder="Search rules..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all"
            />
          </div>
          <button className="px-4 py-2.5 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] flex items-center gap-2 text-[#050038] text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-[#6c757d]">Quick filters:</span>
          <button className="px-3 py-1 bg-[#f0f4ff] text-[#4262FF] rounded-full text-xs font-medium border border-[#4262FF]/20">
            All Rules
          </button>
          <button className="px-3 py-1 bg-white text-[#050038] rounded-full text-xs border border-[#e1e4e8] hover:bg-[#f8f9fa] font-medium transition-colors">
            Discount Rules
          </button>
          <button className="px-3 py-1 bg-white text-[#050038] rounded-full text-xs border border-[#e1e4e8] hover:bg-[#f8f9fa] font-medium transition-colors">
            Term Rules
          </button>
          <button className="px-3 py-1 bg-white text-[#050038] rounded-full text-xs border border-[#e1e4e8] hover:bg-[#f8f9fa] font-medium transition-colors">
            Active
          </button>
          <button className="px-3 py-1 bg-white text-[#050038] rounded-full text-xs border border-[#e1e4e8] hover:bg-[#f8f9fa] font-medium transition-colors">
            Needs Review
          </button>
        </div>
      </header>

      {/* Rules Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-lg border border-[#e1e4e8] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e1e4e8]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Rule Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Conditions</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Approvals Triggered</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e4e8]">
              {rules.map((rule, idx) => (
                <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#050038] max-w-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#4262FF] flex-shrink-0" />
                      <span className="truncate">{rule.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.type === "Discount" 
                        ? "bg-[#e3f2fd] text-[#1565c0]" 
                        : "bg-[#e8f5e9] text-[#2e7d32]"
                    }`}>
                      {rule.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6c757d]">
                    <span className="px-2 py-1 bg-[#f8f9fa] text-[#050038] rounded text-xs font-mono">
                      {rule.conditions} condition{rule.conditions !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6c757d]">{rule.approvals} approval{rule.approvals !== 1 ? 's' : ''}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded text-xs font-medium">
                      {rule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    {rule.visibility === "Code Only" ? (
                      <span className="text-xs text-[#6c757d] italic">Advanced</span>
                    ) : (
                      <button className="text-[#6c757d] hover:text-[#050038]">•••</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explanation Card */}
        <div className="mt-6 bg-[#f8f9fa] rounded-lg border border-[#e1e4e8] p-5">
          <h3 className="font-semibold text-[#050038] mb-2 text-sm">💡 Quick Tip</h3>
          <p className="text-sm text-[#6c757d]">
            Use filters to quickly find specific rules. Click on any rule to edit its configuration.
          </p>
        </div>
      </div>
    </div>
  );
}