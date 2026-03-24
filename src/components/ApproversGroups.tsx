import { Plus, Search, Filter, Users, Edit, Trash2, Eye, Copy, MoreVertical, X, Shield, Loader2, Info } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CreateGroupModal } from './CreateGroupModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface Group {
  id: number;
  name: string;
  members: string[];
  requiredApprovals: number;
  usedIn: number;
}

export function ApproversGroups() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Group | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [sizeFilter, setSizeFilter] = useState<string>('');
  const [usageFilter, setUsageFilter] = useState<string>('');

  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: "Deal Desk", members: ["Yi-an Zhang", "Spyri Karasavva"], requiredApprovals: 2, usedIn: 12 },
    { id: 2, name: "Finance Team", members: ["Amy Wang", "Miles Zimmerman"], requiredApprovals: 1, usedIn: 8 },
    { id: 3, name: "VP of Sales", members: ["Danek Li"], requiredApprovals: 1, usedIn: 6 },
    { id: 4, name: "Legal Team", members: ["Ankitr Wadhina"], requiredApprovals: 1, usedIn: 4 },
  ]);

  const groupFilterCount = [sizeFilter, usageFilter].filter(Boolean).length;

  const clearGroupFilters = () => {
    setSizeFilter('');
    setUsageFilter('');
  };

  const filteredGroups = groups.filter(group => {
    // Size filter
    if (sizeFilter === '1') { if (group.members.length !== 1) return false; }
    else if (sizeFilter === '2-3') { if (group.members.length < 2 || group.members.length > 3) return false; }
    else if (sizeFilter === '4+') { if (group.members.length < 4) return false; }

    // Usage filter
    if (usageFilter === 'unused') { if (group.usedIn > 0) return false; }
    else if (usageFilter === '1-5') { if (group.usedIn < 1 || group.usedIn > 5) return false; }
    else if (usageFilter === '6+') { if (group.usedIn < 6) return false; }

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const groupNameMatch = group.name.toLowerCase().includes(query);
    const memberMatch = group.members.some(member =>
      member.toLowerCase().includes(query)
    );
    return groupNameMatch || memberMatch;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    if (Array.isArray(aValue) && Array.isArray(bValue)) {
      return sortConfig.direction === 'asc'
        ? aValue.length - bValue.length
        : bValue.length - aValue.length;
    }
    return 0;
  });

  const handleSort = (key: keyof Group) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAddGroup = () => {
    setEditingGroup(null);
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowCreateModal(true);
  };

  const getTriggersUsingGroup = (groupName: string) => {
    const mockTriggers = [
      { id: 1, name: "High Discount Approval", when: "Discount > 20%" },
      { id: 2, name: "Extended Payment Terms", when: "Payment Terms = Net 90" },
      { id: 3, name: "Auto-Renewal Disabled", when: "Auto-renewal = Off" },
    ];
    return mockTriggers.filter(t =>
      t.name.toLowerCase().includes(groupName.toLowerCase()) ||
      groupName.toLowerCase().includes('deal desk') && t.name.includes('Discount') ||
      groupName.toLowerCase().includes('finance') && t.name.includes('Payment') ||
      groupName.toLowerCase().includes('legal') && t.name.includes('Renewal')
    );
  };

  const handleDeleteGroup = (group: Group) => {
    setDeletingGroup(group);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingGroup) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setGroups(groups.filter(g => g.id !== deletingGroup.id));
        toast.success(`Group "${deletingGroup.name}" deleted successfully`);
        setDeletingGroup(null);
        setShowDeleteDialog(false);
      } catch (error) {
        toast.error('Failed to delete group. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDuplicateGroup = async (group: Group) => {
    const newGroup: Omit<Group, 'id' | 'usedIn'> = {
      name: `${group.name} (Copy)`,
      members: [...group.members],
      requiredApprovals: group.requiredApprovals,
    };
    await handleSaveGroup(newGroup);
    toast.success(`Group "${newGroup.name}" duplicated successfully`);
  };

  const handleViewDetails = (group: Group) => {
    setViewingGroup(group);
    setShowViewDetails(true);
  };

  const handleSaveGroup = async (groupData: Omit<Group, 'id' | 'usedIn'>) => {
    setIsLoading(true);
    try {
      const existingGroup = groups.find(g =>
        g.name.toLowerCase() === groupData.name.toLowerCase().trim() &&
        (!editingGroup || g.id !== editingGroup.id)
      );
      if (existingGroup) {
        toast.error(`A group named "${groupData.name}" already exists. Please choose a different name.`);
        setIsLoading(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      if (editingGroup) {
        setGroups(groups.map(g =>
          g.id === editingGroup.id
            ? { ...g, ...groupData }
            : g
        ));
        toast.success(`Group "${groupData.name}" updated successfully`);
      } else {
        const newId = Math.max(...groups.map(g => g.id), 0) + 1;
        setGroups([...groups, {
          id: newId,
          ...groupData,
          usedIn: 0
        }]);
        toast.success(`Group "${groupData.name}" created successfully`);
      }
      setShowCreateModal(false);
      setEditingGroup(null);
    } catch (error) {
      toast.error(editingGroup ? 'Failed to update group. Please try again.' : 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToTriggers = (groupName: string) => {
    navigate('/triggers', { state: { filterGroup: groupName } });
  };

  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Approvers & Groups</h1>
            <p className="text-[#999891] text-[12px] mt-0.5">Manage approval groups and their members</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
                aria-label="Search approver groups or members"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 px-2.5 border rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
                groupFilterCount > 0
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                  : 'border-[#e2e0d8] text-[#333333]'
              }`}
              aria-label="Filter groups"
              aria-expanded={showFilters}
            >
              <Filter className={`w-3.5 h-3.5 ${groupFilterCount > 0 ? 'text-[#1a1a1a]' : 'text-[#999891]'}`} />
              Filters
              {groupFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[10px] flex items-center justify-center">{groupFilterCount}</span>
              )}
            </button>
            <button
              onClick={handleAddGroup}
              disabled={isLoading}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              aria-label="Add new approval group"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add Group
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      {showFilters && (
        <div className="border-b border-[#e2e0d8] bg-[#f9fafb] px-6 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <GroupFilterSelect label="Group Size" value={sizeFilter} options={[{ value: '1', label: '1 member' }, { value: '2-3', label: '2-3 members' }, { value: '4+', label: '4+ members' }]} onChange={setSizeFilter} />
            <GroupFilterSelect label="Usage" value={usageFilter} options={[{ value: 'unused', label: 'Unused' }, { value: '1-5', label: '1-5 triggers' }, { value: '6+', label: '6+ triggers' }]} onChange={setUsageFilter} />
            {groupFilterCount > 0 && (
              <button onClick={clearGroupFilters} className="h-7 px-2 text-[11px] text-[#999891] hover:text-[#333333] inline-flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {sortedGroups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-[#f0efe9] flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-[#d1d5db]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-1">
              {searchQuery ? `No groups found matching "${searchQuery}"` : 'No approval groups yet'}
            </h3>
            <p className="text-[12px] text-[#999891]">
              {searchQuery ? 'Try a different search term' : 'Create your first approval group to get started'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider w-[180px]">Group Name</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Members</th>
                    <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider w-[100px]">Required</th>
                    <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider w-[80px]">Triggers</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f1f4]">
                  {sortedGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="w-3.5 h-3.5 text-[#1a1a1a] flex-shrink-0" />
                          <span className="text-[13px] font-medium text-[#1a1a1a] truncate">{group.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {group.members.slice(0, 3).map((member, idx) => (
                            <span key={idx} className="inline-flex items-center px-1.5 py-0.5 bg-[#f0efe9] rounded text-[11px] text-[#333333] max-w-[120px] truncate">
                              {member}
                            </span>
                          ))}
                          {group.members.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-[#e2e0d8] rounded text-[11px] text-[#666666] font-medium">
                              +{group.members.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center text-[13px] text-[#333333] tabular-nums">
                        {group.requiredApprovals} of {group.members.length}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          onClick={() => handleNavigateToTriggers(group.name)}
                          className="text-[#1a1a1a] hover:text-[#333333] text-[13px] font-medium tabular-nums transition-colors"
                        >
                          {group.usedIn}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="p-1 rounded-md text-[#999891] hover:text-[#333333] hover:bg-[#f0efe9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                              aria-label={`Actions for ${group.name}`}
                              aria-haspopup="true"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 bg-white border border-[#e2e0d8] shadow-lg rounded-lg">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(group)}
                              className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditGroup(group)}
                              className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                            >
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicateGroup(group)}
                              className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                            >
                              <Copy className="w-3.5 h-3.5 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteGroup(group)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer text-[13px]"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingGroup(null);
          }}
          onSave={handleSaveGroup}
          editingGroup={editingGroup}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border border-[#e2e0d8] rounded-xl shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1a1a1a] text-[15px]">Delete Approval Group</AlertDialogTitle>
            <AlertDialogDescription className="text-[#666666] text-[13px]">
              {deletingGroup && (
                <>
                  Are you sure you want to delete <strong className="text-[#1a1a1a]">{deletingGroup.name}</strong>?
                  {deletingGroup.usedIn > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Shield className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-[12px] text-red-800">
                          <strong>Warning:</strong> This group is used in {deletingGroup.usedIn} trigger{deletingGroup.usedIn > 1 ? 's' : ''}.
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <div className="text-[11px] font-semibold text-red-800 mb-1.5">Affected Triggers:</div>
                        <div className="space-y-1">
                          {getTriggersUsingGroup(deletingGroup.name).slice(0, 5).map((trigger) => (
                            <div key={trigger.id} className="text-[11px] text-red-700 flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                              {trigger.name} ({trigger.when})
                            </div>
                          ))}
                          {getTriggersUsingGroup(deletingGroup.name).length > 5 && (
                            <div className="text-[11px] text-red-600 italic">
                              ...and {getTriggersUsingGroup(deletingGroup.name).length - 5} more
                            </div>
                          )}
                          {getTriggersUsingGroup(deletingGroup.name).length === 0 && (
                            <div className="text-[11px] text-red-600 italic">
                              Unable to load trigger details
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingGroup(null);
              }}
              className="border-[#e2e0d8] text-[#333333] hover:bg-[#f9fafb] text-[13px]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showViewDetails && viewingGroup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-0 sm:p-4 backdrop-blur-[2px]"
          onClick={(e) => e.target === e.currentTarget && (() => { setShowViewDetails(false); setViewingGroup(null); })()}
        >
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-xl shadow-2xl overflow-auto">
            <div className="sticky top-0 bg-white border-b border-[#e2e0d8] px-5 py-3.5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Group Details</h2>
                <p className="text-[12px] text-[#999891] mt-0.5">{viewingGroup.name}</p>
              </div>
              <button
                onClick={() => { setShowViewDetails(false); setViewingGroup(null); }}
                className="p-1.5 hover:bg-[#f0efe9] rounded-md transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#999891]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#666666] mb-1">Group Name</label>
                <p className="text-[13px] font-medium text-[#1a1a1a]">{viewingGroup.name}</p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#666666] mb-1.5">
                  Members ({viewingGroup.members.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {viewingGroup.members.map((member, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-1 bg-[#f0efe9] rounded text-[12px] text-[#333333]">
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#666666] mb-1">Required Approvals</label>
                <p className="text-[13px] text-[#1a1a1a] tabular-nums">
                  {viewingGroup.requiredApprovals} of {viewingGroup.members.length}
                </p>
                <p className="text-[11px] text-[#999891] mt-0.5">
                  {viewingGroup.requiredApprovals} member{viewingGroup.requiredApprovals > 1 ? 's' : ''} must approve
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#666666] mb-1">Usage</label>
                <p className="text-[13px] text-[#1a1a1a] tabular-nums">
                  {viewingGroup.usedIn} trigger{viewingGroup.usedIn !== 1 ? 's' : ''}
                </p>
                {viewingGroup.usedIn > 0 && (
                  <button
                    onClick={() => {
                      setShowViewDetails(false);
                      setViewingGroup(null);
                      handleNavigateToTriggers(viewingGroup.name);
                    }}
                    className="mt-1 text-[12px] text-[#1a1a1a] hover:text-[#333333] font-medium transition-colors underline underline-offset-2 decoration-[#e2e0d8] hover:decoration-[#999891]"
                  >
                    View triggers using this group
                  </button>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#e2e0d8] px-5 py-3 flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowViewDetails(false); setViewingGroup(null); }}
                className="h-8 px-3 border border-[#e2e0d8] rounded-md hover:bg-[#f0efe9] text-[#333333] text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewDetails(false);
                  handleEditGroup(viewingGroup);
                }}
                className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:ring-offset-1"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupFilterSelect({ label, value, options, onChange }: {
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
      <svg className={`w-3 h-3 absolute right-1.5 pointer-events-none ${value ? 'text-white' : 'text-[#999891]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </div>
  );
}
