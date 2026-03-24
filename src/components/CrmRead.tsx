import { Plus, Search, Database, Edit, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  type ReadField,
  type ReadFieldFormData,
  type Visibility,
  type Editability,
  listReadFields,
  createReadField,
  updateReadField,
  deleteReadField,
} from './crmReadStore';

export function CrmRead() {
  const [fields, setFields] = useState<ReadField[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState<ReadFieldFormData>({
    order: 0,
    crmField: '',
    displayName: '',
    editable: 'Read-only',
    visible: 'Hidden',
  });

  useEffect(() => {
    setFields(listReadFields());
  }, []);

  const filtered = fields.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.crmField.toLowerCase().includes(q) ||
      f.displayName.toLowerCase().includes(q)
    );
  });

  const toggleVisibility = (field: ReadField) => {
    const newVis: Visibility = field.visible === 'Visible' ? 'Hidden' : 'Visible';
    const updated = updateReadField(field.id, { visible: newVis });
    setFields(prev => prev.map(f => (f.id === updated.id ? updated : f)));
    toast.success(`Field ${newVis === 'Visible' ? 'shown' : 'hidden'}`);
  };

  const toggleEditable = (field: ReadField) => {
    const newEdit: Editability = field.editable === 'Read-only' ? 'Editable' : 'Read-only';
    const updated = updateReadField(field.id, { editable: newEdit });
    setFields(prev => prev.map(f => (f.id === updated.id ? updated : f)));
    toast.success(`Field set to ${newEdit.toLowerCase()}`);
  };

  const startEdit = (field: ReadField) => {
    setEditingId(field.id);
    setFormData({
      order: field.order,
      crmField: field.crmField,
      displayName: field.displayName,
      editable: field.editable,
      visible: field.visible,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAddingNew(false);
  };

  const saveEdit = () => {
    if (addingNew) {
      if (!formData.crmField.trim()) {
        toast.error('CRM Field is required');
        return;
      }
      const created = createReadField({ ...formData, order: fields.length + 1 });
      setFields(prev => [...prev, created]);
      toast.success('Field added');
      setAddingNew(false);
    } else if (editingId !== null) {
      const updated = updateReadField(editingId, formData);
      setFields(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      toast.success('Field updated');
      setEditingId(null);
    }
  };

  const handleDelete = (field: ReadField) => {
    deleteReadField(field.id);
    setFields(prev => prev.filter(f => f.id !== field.id));
    toast.success('Field removed');
  };

  const startAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setFormData({ order: fields.length + 1, crmField: '', displayName: '', editable: 'Read-only', visible: 'Visible' });
  };

  return (
    <div className="h-full flex flex-col">
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">CRM Context UX Config</h1>
            <p className="text-[11px] text-[#999891] mt-0.5">Opportunity Object &mdash; Fields displayed in the deal context panel</p>
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
              onClick={startAdd}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              Field
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider w-16">Order</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">CRM Field</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Display Name</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider w-40">Properties</th>
                  <th className="px-3 py-2.5 w-24 text-left text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f1f4]">
                {addingNew && (
                  <InlineAddRow
                    formData={formData}
                    setFormData={setFormData}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                  />
                )}
                {filtered.length === 0 && !addingNew ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Database className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                      <p className="text-[13px] font-medium text-[#333333]">
                        {searchQuery ? `No fields matching "${searchQuery}"` : 'No CRM fields configured'}
                      </p>
                      <p className="text-[12px] text-[#999891] mt-0.5">
                        {searchQuery ? 'Try a different search' : 'Add your first CRM context field'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(field =>
                    editingId === field.id ? (
                      <InlineAddRow
                        key={field.id}
                        formData={formData}
                        setFormData={setFormData}
                        onSave={saveEdit}
                        onCancel={cancelEdit}
                      />
                    ) : (
                      <tr key={field.id} className="hover:bg-[#f9fafb] transition-colors group">
                        <td className="px-4 py-2.5 text-[13px] text-[#999891] tabular-nums">{field.order}</td>
                        <td className="px-4 py-2.5">
                          <code className="text-[12px] text-[#1a1a1a] bg-[#f5f6f8] px-1.5 py-0.5 rounded font-mono">
                            {field.crmField}
                          </code>
                        </td>
                        <td className="px-4 py-2.5 text-[13px] text-[#666666]">
                          {field.displayName || <span className="text-[#ccc]">&mdash;</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => toggleEditable(field)}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                                field.editable === 'Editable'
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                              title={`Click to toggle — currently ${field.editable}`}
                            >
                              {field.editable}
                            </button>
                            <button
                              onClick={() => toggleVisibility(field)}
                              className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                field.visible === 'Visible'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                              title={`Click to toggle — currently ${field.visible}`}
                            >
                              {field.visible === 'Visible' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              {field.visible}
                            </button>
                          </div>
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
      </div>
    </div>
  );
}

function InlineAddRow({
  formData,
  setFormData,
  onSave,
  onCancel,
}: {
  formData: ReadFieldFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReadFieldFormData>>;
  onSave: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <tr className="bg-[#fffef9]">
      <td className="px-4 py-2 text-[12px] text-[#999891] tabular-nums">{formData.order}</td>
      <td className="px-4 py-2">
        <input
          ref={ref}
          value={formData.crmField}
          onChange={e => setFormData(prev => ({ ...prev, crmField: e.target.value }))}
          placeholder="CRM_Field_Name"
          className="w-full h-7 px-2 border border-[#e2e0d8] rounded text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] bg-white"
        />
      </td>
      <td className="px-4 py-2">
        <input
          value={formData.displayName}
          onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          placeholder="Display name"
          className="w-full h-7 px-2 border border-[#e2e0d8] rounded text-[12px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] bg-white"
        />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <select
            value={formData.editable}
            onChange={e => setFormData(prev => ({ ...prev, editable: e.target.value as Editability }))}
            className="h-7 px-2 border border-[#e2e0d8] rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 bg-white appearance-none cursor-pointer pr-5"
          >
            <option value="Read-only">Read-only</option>
            <option value="Editable">Editable</option>
          </select>
          <select
            value={formData.visible}
            onChange={e => setFormData(prev => ({ ...prev, visible: e.target.value as Visibility }))}
            className="h-7 px-2 border border-[#e2e0d8] rounded text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 bg-white appearance-none cursor-pointer pr-5"
          >
            <option value="Visible">Visible</option>
            <option value="Hidden">Hidden</option>
          </select>
        </div>
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
