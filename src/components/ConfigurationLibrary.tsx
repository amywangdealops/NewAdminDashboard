import { Plus, Search, Database } from 'lucide-react';
import { useState } from 'react';

export function ConfigurationLibrary() {
  const [activeTab, setActiveTab] = useState<'terms' | 'approvalGroups'>('terms');

  const terms = [
    { order: 1, name: "Start Date", segments: "All segments", category: "Core Terms", inputType: "Date", options: "-", status: "On" },
    { order: 2, name: "End Date", segments: "All segments", category: "Core Terms", inputType: "Date", options: "-", status: "On" },
    { order: 3, name: "Subscription Terms", segments: "All segments", category: "Core Terms", inputType: "Number", options: "-", status: "On" },
    { order: 4, name: "Billing Frequency", segments: "Mid-Market", category: "Core Terms", inputType: "Select", options: "Annual, Upfront, Semi-Annual...", status: "On" },
    { order: 5, name: "Payment Terms", segments: "All segments", category: "Core Terms", inputType: "Select", options: "Net 30, Net 60, Net 90", status: "On" },
    { order: 6, name: "Entity", segments: "All segments", category: "Core Terms", inputType: "Select", options: "Harvey US, Harvey Ireland", status: "On" },
  ];

  const approvalGroups = [
    { order: 1, name: "L1", assignees: "Amy Wang, Miles Zimmerman", requiredApprovals: 1 },
    { order: 2, name: "L2", assignees: "Miles Zimmerman, Danek Li", requiredApprovals: 1 },
    { order: 2, name: "L2 (EMEA)", assignees: "Amy Wang, Miles Zimmerman, Spyri Karasavva", requiredApprovals: 1 },
    { order: 3, name: "Head of Mid-Market", assignees: "Ankitr Wadhina", requiredApprovals: 1 },
    { order: 3, name: "Deal Desk", assignees: "Yi-an Zhang, Spyri Karasavva", requiredApprovals: 2 },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-[#e1e4e8] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#050038]">Settings</h1>
            <p className="text-[#6c757d] mt-1 text-sm">Manage term definitions and approval group assignments</p>
          </div>
          <button className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add {activeTab === 'terms' ? 'Term' : 'Approval Group'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#e1e4e8]">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'terms'
                ? 'border-[#4262FF] text-[#4262FF]'
                : 'border-transparent text-[#6c757d] hover:text-[#050038]'
            }`}
          >
            Term Library
          </button>
          <button
            onClick={() => setActiveTab('approvalGroups')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'approvalGroups'
                ? 'border-[#4262FF] text-[#4262FF]'
                : 'border-transparent text-[#6c757d] hover:text-[#050038]'
            }`}
          >
            Approval Groups
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-8 py-4 bg-white border-b border-[#e1e4e8]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'terms' ? 'terms' : 'approval groups'}...`}
            className="w-full pl-10 pr-4 py-2.5 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {activeTab === 'terms' ? (
          <div className="bg-white rounded-lg border border-[#e1e4e8] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f8f9fa] border-b border-[#e1e4e8]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Term Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Segments</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Input Type</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Options</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e4e8]">
                {terms.map((term, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#6c757d]">{term.order}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#050038]">{term.name}</td>
                    <td className="px-6 py-4 text-sm text-[#6c757d]">{term.segments}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-[#e3f2fd] text-[#1565c0] rounded text-xs font-medium">
                        {term.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6c757d]">{term.inputType}</td>
                    <td className="px-6 py-4 text-sm text-[#6c757d] max-w-xs truncate">{term.options}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded text-xs font-medium">
                        {term.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button className="text-[#6c757d] hover:text-[#050038]">•••</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#e1e4e8] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f8f9fa] border-b border-[#e1e4e8]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Chain Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Group Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Assignees</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Required Approvals</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e4e8]">
                {approvalGroups.map((group, idx) => (
                  <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 text-sm text-[#6c757d]">
                      <span className="px-2 py-1 bg-[#f8f9fa] text-[#050038] rounded font-mono text-xs">
                        {group.order}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#050038]">{group.name}</td>
                    <td className="px-6 py-4 text-sm text-[#6c757d]">{group.assignees}</td>
                    <td className="px-6 py-4 text-sm text-[#050038]">{group.requiredApprovals}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button className="text-[#6c757d] hover:text-[#050038]">•••</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}