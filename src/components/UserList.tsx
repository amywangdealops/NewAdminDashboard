import { Search, Users, ArrowUpDown, Download, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { type User, type UserRole, type UserPermission, listUsers, updateUser, getManagerOptions, ALL_ROLES, ALL_PERMISSIONS } from './userStore';

type SortField = 'name' | 'role';
type SortDir = 'asc' | 'desc';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingSlackId, setEditingSlackId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [permissionFilter, setPermissionFilter] = useState<UserPermission | ''>('');

  useEffect(() => {
    setUsers(listUsers());
  }, []);

  const managerOptions = useMemo(() => getManagerOptions(users), [users]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleFieldChange = (userId: number, data: Partial<Omit<User, 'id'>>) => {
    const updated = updateUser(userId, data);
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
  };

  const handleSlackIdChange = (userId: number, newSlackId: string) => {
    if (newSlackId.trim()) {
      const updated = updateUser(userId, { slackId: newSlackId.trim() });
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    }
    setEditingSlackId(null);
  };

  const activeFilterCount = (roleFilter ? 1 : 0) + (permissionFilter ? 1 : 0);

  const filtered = useMemo(() => {
    let result = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q));
    }
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }
    if (permissionFilter) {
      result = result.filter(u => u.permission === permissionFilter);
    }
    result.sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [users, searchQuery, roleFilter, permissionFilter, sortField, sortDir]);

  const roleOrder: Record<UserRole, number> = { Admin: 0, 'Dealops Internal Staff': 1, User: 2 };

  const sortedByRole = useMemo(() => {
    if (sortField !== 'role') return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = roleOrder[a.role] - roleOrder[b.role];
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const displayUsers = sortField === 'role' ? sortedByRole : filtered;

  const downloadCsv = () => {
    const headers = ['Name', 'Role', 'Manager', 'Slack ID', 'Permission'];
    const rows = displayUsers.map(u => [
      u.name,
      u.role,
      u.manager ?? '',
      u.slackId,
      u.permission,
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#f5f4f0] border border-[#e2e0d8] flex items-center justify-center flex-shrink-0">
              <Users className="w-3.5 h-3.5 text-[#666666]" />
            </div>
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">User List</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
                aria-label="Search users by name"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              className="h-8 pl-2.5 pr-7 bg-[#f5f6f8] border border-[#e2e0d8] rounded-md text-[12px] text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 appearance-none custom-select cursor-pointer"
            >
              <option value="">All Roles</option>
              {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={permissionFilter}
              onChange={(e) => setPermissionFilter(e.target.value as UserPermission | '')}
              className="h-8 pl-2.5 pr-7 bg-[#f5f6f8] border border-[#e2e0d8] rounded-md text-[12px] text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 appearance-none custom-select cursor-pointer"
            >
              <option value="">All Permissions</option>
              {ALL_PERMISSIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setRoleFilter(''); setPermissionFilter(''); }}
                className="inline-flex items-center gap-1 h-8 px-2.5 text-[12px] font-medium text-[#666666] hover:text-[#1a1a1a] transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
            <div className="w-px h-5 bg-[#e2e0d8]" />
            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-white bg-[#1a1a1a] border border-[#1a1a1a] rounded-md hover:bg-[#333333] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
        </div>
      </header>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
              <tr>
                <th className="text-left px-4 py-2.5">
                  <button
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider hover:text-[#1a1a1a] transition-colors"
                  >
                    Name
                    {sortField === 'name' && (
                      <span className="text-[#1a1a1a]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-2.5">
                  <button
                    onClick={() => handleSort('role')}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider hover:text-[#1a1a1a] transition-colors"
                  >
                    Role
                    <ArrowUpDown className="w-3 h-3 text-[#999891]" />
                  </button>
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  Manager
                </th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  Slack ID
                </th>
                <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                  Permissions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                    <p className="text-[13px] font-medium text-[#333333]">
                      {searchQuery || activeFilterCount > 0 ? 'No users match the current filters' : 'No users found'}
                    </p>
                    <p className="text-[12px] text-[#999891] mt-0.5">
                      {searchQuery || activeFilterCount > 0 ? 'Try adjusting your search or filters' : 'Users will appear here once added'}
                    </p>
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{user.name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={user.role}
                        onChange={(e) => handleFieldChange(user.id, { role: e.target.value as UserRole })}
                        className="h-7 pl-1 pr-7 border border-transparent rounded-md text-[13px] text-[#666666] bg-transparent hover:bg-[#f0efe9] focus:bg-white focus:border-[#e2e0d8] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 appearance-none custom-select cursor-pointer transition-colors"
                      >
                        {ALL_ROLES.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={user.manager ?? ''}
                        onChange={(e) => handleFieldChange(user.id, { manager: e.target.value || null })}
                        className="h-7 pl-1 pr-7 border border-transparent rounded-md text-[13px] text-[#666666] bg-transparent hover:bg-[#f0efe9] focus:bg-white focus:border-[#e2e0d8] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 appearance-none custom-select cursor-pointer transition-colors"
                      >
                        <option value="">-</option>
                        {managerOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      {editingSlackId === user.id ? (
                        <input
                          autoFocus
                          defaultValue={user.slackId}
                          onBlur={(e) => handleSlackIdChange(user.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSlackIdChange(user.id, (e.target as HTMLInputElement).value);
                            if (e.key === 'Escape') setEditingSlackId(null);
                          }}
                          className="h-7 w-36 px-2 border border-[#e2e0d8] rounded-md text-[13px] text-[#666666] font-mono tabular-nums bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingSlackId(user.id)}
                          className="text-[13px] text-[#666666] font-mono tabular-nums hover:text-[#1a1a1a] transition-colors rounded px-1 -mx-1 py-0.5 hover:bg-[#f0efe9]"
                        >
                          {user.slackId}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <select
                        value={user.permission}
                        onChange={(e) => handleFieldChange(user.id, { permission: e.target.value as UserPermission })}
                        className={`h-7 pl-2 pr-7 rounded-full text-[11px] font-medium border-none focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 appearance-none custom-select cursor-pointer transition-colors ${
                          user.permission === 'Full Access'
                            ? 'bg-[#e8f5e9] text-[#2e7d32]'
                            : user.permission === 'Edit'
                              ? 'bg-[#fff8e1] text-[#f57f17]'
                              : 'bg-[#f5f4f0] text-[#666666]'
                        }`}
                      >
                        {ALL_PERMISSIONS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
