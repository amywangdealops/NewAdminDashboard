import { Plus, Search, Filter, ArrowUpDown, Database, Edit, Trash2, Copy, Check, X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  type WritebackField,
  type WritebackFieldFormData,
  type CrmObject,
  listWritebackFields,
  createWritebackField,
  updateWritebackField,
  deleteWritebackField,
} from './crmWritebackStore';

interface Filters {
  crmObject: string;
  status: string;
}
const EMPTY_FILTERS: Filters = { crmObject: '', status: '' };

type SortField = 'dealopsField' | 'crmObject' | 'crmFieldName' | 'lastModified' | 'status';
type SortDir = 'asc' | 'desc';

export function CrmWriteback() {
  const [fields, setFields] = useState<WritebackField[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState<WritebackFieldFormData>({
    dealopsField: '',
    crmObject: 'Quote',
    crmFieldName: '',
    status: 'On',
  });

  useEffect(() => {
    setFields(listWritebackFields());
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = fields.filter(f => {
    if (filters.crmObject && f.crmObject !== filters.crmObject) return false;
    if (filters.status && f.status !== filters.status) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.dealopsField.toLowerCase().includes(q) ||
      f.crmFieldName.toLowerCase().includes(q) ||
      f.crmObject.toLowerCase().includes(q)
    );
  });

  const display = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const dir = sortDir === 'asc' ? 1 : -1;
    const av = a[sortField] ?? '';
    const bv = b[sortField] ?? '';
    return String(av).localeCompare(String(bv)) * dir;
  });

  const toggleStatus = (field: WritebackField) => {
    const newStatus = field.status === 'On' ? 'Off' : 'On';
    const updated = updateWritebackField(field.id, { status: newStatus });
    setFields(prev => prev.map(f => (f.id === updated.id ? updated : f)));
    toast.success(`Field ${newStatus === 'On' ? 'enabled' : 'disabled'}`);
  };

  const startEdit = (field: WritebackField) => {
    setEditingId(field.id);
    setFormData({
      dealopsField: field.dealopsField,
      crmObject: field.crmObject,
      crmFieldName: field.crmFieldName,
      status: field.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAddingNew(false);
  };

  const saveEdit = () => {
    if (addingNew) {
      if (!formData.crmFieldName.trim()) {
        toast.error('CRM Field Name is required');
        return;
      }
      const created = createWritebackField(formData);
      setFields(prev => [...prev, created]);
      toast.success('Field mapping added');
      setAddingNew(false);
    } else if (editingId !== null) {
      const updated = updateWritebackField(editingId, formData);
      setFields(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      toast.success('Field mapping updated');
      setEditingId(null);
    }
  };

  const handleDelete = (field: WritebackField) => {
    deleteWritebackField(field.id);
    setFields(prev => prev.filter(f => f.id !== field.id));
    toast.success('Field mapping deleted');
  };

  const startAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setFormData({ dealopsField: '', crmObject: 'Quote', crmFieldName: '', status: 'On' });
  };

  const SortHeader = ({ field, children, className = '' }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th
      className={`text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider cursor-pointer select-none group hover:text-[#1a1a1a] transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field ? (
          <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </span>
    </th>
  );

  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">CRM Integration</h1>
            <p className="text-[11px] text-[#999891] mt-0.5">Writeback field mappings from Dealops to your CRM</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search fields..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 px-2.5 border rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
                activeFilterCount > 0
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                  : 'border-[#e2e0d8] text-[#333333]'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? 'text-[#1a1a1a]' : 'text-[#999891]'}`} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={startAdd}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              Field
            </button>
          </div>
        </div>
      </header>

      {showFilters && (
        <div className="border-b border-[#e2e0d8] bg-[#f9fafb] px-6 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelect
              label="CRM Object"
              value={filters.crmObject}
              options={['Quote', 'Opportunity']}
              onChange={v => setFilters(prev => ({ ...prev, crmObject: v }))}
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              options={['On', 'Off']}
              onChange={v => setFilters(prev => ({ ...prev, status: v }))}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="h-7 px-2 text-[11px] text-[#999891] hover:text-[#333333] inline-flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
                <tr>
                  <SortHeader field="dealopsField">Dealops Field</SortHeader>
                  <SortHeader field="crmObject">CRM Object</SortHeader>
                  <SortHeader field="crmFieldName">CRM Field Name</SortHeader>
                  <SortHeader field="lastModified">Last Modified</SortHeader>
                  <SortHeader field="status">Status</SortHeader>
                  <th className="px-3 py-2.5 w-28 text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f1f4]">
                {addingNew && (
                  <InlineEditRow
                    formData={formData}
                    setFormData={setFormData}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                  />
                )}
                {display.length === 0 && !addingNew ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Database className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                      <p className="text-[13px] font-medium text-[#333333]">
                        {searchQuery ? `No fields matching "${searchQuery}"` : 'No writeback fields configured'}
                      </p>
                      <p className="text-[12px] text-[#999891] mt-0.5">
                        {searchQuery ? 'Try a different search' : 'Add your first CRM field mapping'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  display.map(field =>
                    editingId === field.id ? (
                      <InlineEditRow
                        key={field.id}
                        formData={formData}
                        setFormData={setFormData}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                      />
                    ) : (
                      <tr key={field.id} className="hover:bg-[#f9fafb] transition-colors group">
                        <td className="px-4 py-2.5 text-[13px] text-[#666666]">
                          {field.dealopsField || <span className="text-[#ccc]">&mdash;</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                            field.crmObject === 'Quote'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-violet-50 text-violet-700'
                          }`}>
                            {field.crmObject}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <code className="text-[12px] text-[#1a1a1a] bg-[#f5f6f8] px-1.5 py-0.5 rounded font-mono">
                            {field.crmFieldName}
                          </code>
                        </td>
                        <td className="px-4 py-2.5 text-[13px] text-[#666666] tabular-nums">{field.lastModified}</td>
                        <td className="px-4 py-2.5">
                          <StatusToggle status={field.status} onToggle={() => toggleStatus(field)} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => startEdit(field)}
                              className="p-1 text-[#999891] hover:text-[#333333] rounded-md hover:bg-[#f0efe9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                              aria-label="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const created = createWritebackField({ ...field, crmFieldName: field.crmFieldName + '_copy' });
                                setFields(prev => [...prev, created]);
                                toast.success('Field duplicated');
                              }}
                              className="p-1 text-[#999891] hover:text-[#333333] rounded-md hover:bg-[#f0efe9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                              aria-label="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(field)}
                              className="p-1 text-[#999891] hover:text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-[#999891] mt-2 text-center tabular-nums">
          {display.length} field{display.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 && ` (filtered from ${fields.length})`}
        </p>
      </div>
    </div>
  );
}

function StatusToggle({ status, onToggle }: { status: 'On' | 'Off'; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:ring-offset-1 ${
        status === 'On' ? 'bg-[var(--switch-checked)]' : 'bg-gray-300'
      }`}
      role="switch"
      aria-checked={status === 'On'}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          status === 'On' ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

function InlineEditRow({
  formData,
  setFormData,
  onSave,
  onCancel,
}: {
  formData: WritebackFieldFormData;
  setFormData: React.Dispatch<React.SetStateAction<WritebackFieldFormData>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <tr className="bg-[#fffef9]">
      <td className="px-4 py-2">
        <input
          ref={ref}
          value={formData.dealopsField}
          onChange={e => setFormData(prev => ({ ...prev, dealopsField: e.target.value }))}
          placeholder="Dealops field name"
          className="w-full h-7 px-2 border border-[#e2e0d8] rounded text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] bg-white"
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={formData.crmObject}
          onChange={e => setFormData(prev => ({ ...prev, crmObject: e.target.value as CrmObject }))}
          className="h-7 px-2 border border-[#e2e0d8] rounded text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] bg-white appearance-none cursor-pointer pr-6"
        >
          <option value="Quote">Quote</option>
          <option value="Opportunity">Opportunity</option>
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          value={formData.crmFieldName}
          onChange={e => setFormData(prev => ({ ...prev, crmFieldName: e.target.value }))}
          placeholder="CRM_Field_Name_c"
          className="w-full h-7 px-2 border border-[#e2e0d8] rounded text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] bg-white"
        />
      </td>
      <td className="px-4 py-2 text-[12px] text-[#999891]">Now</td>
      <td className="px-4 py-2">
        <select
          value={formData.status}
          onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'On' | 'Off' }))}
          className="h-7 px-2 border border-[#e2e0d8] rounded text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] bg-white appearance-none cursor-pointer pr-6"
        >
          <option value="On">On</option>
          <option value="Off">Off</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={onSave}
            className="p-1 text-emerald-600 hover:text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            aria-label="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="p-1 text-[#999891] hover:text-[#333333] rounded-md hover:bg-[#f0efe9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
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
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <svg className={`w-3 h-3 absolute right-1.5 pointer-events-none ${value ? 'text-white' : 'text-[#999891]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
