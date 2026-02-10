import { Plus, Search, Users } from 'lucide-react';

export function ApproversGroups() {
  const groups = [
    { name: "Deal Desk", members: ["Yi-an Zhang", "Spyri Karasavva"], requiredApprovals: 2, usedIn: 12 },
    { name: "Finance Team", members: ["Amy Wang", "Miles Zimmerman"], requiredApprovals: 1, usedIn: 8 },
    { name: "VP of Sales", members: ["Danek Li"], requiredApprovals: 1, usedIn: 6 },
    { name: "Legal Team", members: ["Ankitr Wadhina"], requiredApprovals: 1, usedIn: 4 },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="border-b border-[#e1e4e8] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#050038]">Approvers & Groups</h1>
            <p className="text-[#6c757d] mt-1 text-sm">Manage approval groups and their members</p>
          </div>
          <button className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" />
          <input
            type="text"
            placeholder="Search approver groups..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all"
          />
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-lg border border-[#e1e4e8] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e1e4e8]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Group Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Members</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Required Approvals</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Used in Triggers</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e4e8]">
              {groups.map((group, idx) => (
                <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#050038]">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#4262FF]" />
                      {group.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6c757d]">{group.members.join(", ")}</td>
                  <td className="px-6 py-4 text-sm text-[#050038]">{group.requiredApprovals}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-[#4262FF] hover:underline font-medium">
                      {group.usedIn} triggers
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button className="text-[#6c757d] hover:text-[#050038]">•••</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
