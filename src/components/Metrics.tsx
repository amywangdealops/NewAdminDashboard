import { Plus, Search, DollarSign, MoreVertical, Edit, Trash2, Copy, ChevronDown, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  type Metric,
  type MetricFormData,
  listMetrics,
  createMetric,
  updateMetric,
  deleteMetric,
} from './metricStore';
import { MetricFormDrawer } from './MetricFormDrawer';
import { ViewMetricDrawer } from './ViewMetricDrawer';

type DrawerState =
  | { type: 'closed' }
  | { type: 'add' }
  | { type: 'view'; metric: Metric }
  | { type: 'edit'; metric: Metric }
  | { type: 'duplicate'; metric: Metric };

interface MetricFilters {
  status: string;
  type: string;
  dataSource: string;
}

const EMPTY_FILTERS: MetricFilters = { status: '', type: '', dataSource: '' };

export function Metrics() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MetricFilters>(EMPTY_FILTERS);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>({ type: 'closed' });

  useEffect(() => {
    setMetrics(listMetrics());
  }, []);

  // ─── Handlers ──────────────────────────────────────────

  const handleAddMetric = () => {
    setDrawer({ type: 'add' });
  };

  const handleViewMetric = (metric: Metric) => {
    setDrawer({ type: 'view', metric });
  };

  const handleEditMetric = (metric: Metric) => {
    setDrawer({ type: 'edit', metric });
  };

  const handleDuplicateMetric = (metric: Metric) => {
    setDrawer({ type: 'duplicate', metric });
  };

  const handleDeleteMetric = (metric: Metric) => {
    if (metric.usedInCount > 0) {
      toast.error(`Cannot delete "${metric.name}". It is used in ${metric.usedInCount} report(s).`);
      return;
    }
    deleteMetric(metric.id);
    setMetrics(prev => prev.filter(m => m.id !== metric.id));
    toast.success(`Metric "${metric.name}" deleted successfully`);
  };

  const handleCloseDrawer = () => {
    setDrawer({ type: 'closed' });
  };

  const handleSaveMetric = (data: MetricFormData) => {
    if (drawer.type === 'add' || drawer.type === 'duplicate') {
      const created = createMetric(data);
      setMetrics(prev => [...prev, created]);
      toast.success(drawer.type === 'add' ? 'Metric added' : 'Metric duplicated');
    } else if (drawer.type === 'edit') {
      const updated = updateMetric(drawer.metric.id, data);
      setMetrics(prev => prev.map(m => m.id === updated.id ? updated : m));
      toast.success('Metric updated');
    }
    setDrawer({ type: 'closed' });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ─── Filtering ─────────────────────────────────────────

  const filteredMetrics = metrics.filter(metric => {
    if (filters.status && metric.status !== filters.status) return false;
    if (filters.type && metric.type !== filters.type) return false;
    if (filters.dataSource && metric.dataSource !== filters.dataSource) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      metric.name.toLowerCase().includes(query) ||
      metric.description.toLowerCase().includes(query) ||
      metric.type.toLowerCase().includes(query) ||
      metric.calculationMethod.toLowerCase().includes(query)
    );
  });

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Metrics</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
                aria-label="Search metrics"
              />
            </div>
            <button
              onClick={handleAddMetric}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              aria-label="Add new metric"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Metric
            </button>
          </div>
        </div>
      </header>

      {/* Metric Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
              <tr>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Metric Name</th>
                <ColumnFilter
                  label="Type"
                  value={filters.type}
                  options={['Financial', 'Operational', 'Custom']}
                  onChange={(v) => setFilters(prev => ({ ...prev, type: v }))}
                />
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Format</th>
                <ColumnFilter
                  label="Source"
                  value={filters.dataSource}
                  options={['CRM', 'Manual', 'Calculated']}
                  onChange={(v) => setFilters(prev => ({ ...prev, dataSource: v }))}
                />
                <ColumnFilter
                  label="Status"
                  value={filters.status}
                  options={['Active', 'Inactive']}
                  onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                />
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <DollarSign className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                    <p className="text-[13px] font-medium text-[#333333]">
                      {searchQuery ? `No metrics found matching "${searchQuery}"` : 'No metrics found'}
                    </p>
                    <p className="text-[12px] text-[#999891] mt-0.5">
                      {searchQuery ? 'Try a different search term' : 'Add your first metric to get started'}
                    </p>
                  </td>

                </tr>
              ) : (
                filteredMetrics.map((metric) => (
                <tr key={metric.id} className="hover:bg-[#f9fafb] transition-colors cursor-pointer" onClick={() => handleViewMetric(metric)}>
                  <td className="px-4 py-2.5">
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{metric.name}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <TypeBadge type={metric.type} />
                  </td>

                  <td className="px-4 py-2.5 text-[13px] text-[#666666]">{metric.format}</td>
                  <td className="px-4 py-2.5">
                    <SourceBadge source={metric.dataSource} />
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      metric.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${metric.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {metric.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-[#999891] hover:text-[#333333] p-1 rounded-md hover:bg-[#f0efe9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                          aria-label={`Actions for ${metric.name}`}
                          aria-haspopup="true"
                        >
                          <MoreVertical className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white border border-[#e2e0d8] shadow-lg rounded-lg">
                        <DropdownMenuItem
                          onClick={() => handleEditMetric(metric)}
                          className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                        >
                          <Edit className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateMetric(metric)}
                          className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                        >
                          <Copy className="w-3.5 h-3.5 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteMetric(metric)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer text-[13px]"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* View Drawer */}
      {drawer.type === 'view' && (
        <ViewMetricDrawer
          metric={drawer.metric}
          onClose={handleCloseDrawer}
          onEdit={(m) => setDrawer({ type: 'edit', metric: m })}
        />
      )}

      {/* Form Drawer */}
      {(drawer.type === 'add' || drawer.type === 'edit' || drawer.type === 'duplicate') && (
        <MetricFormDrawer
          mode={drawer.type}
          metric={drawer.type !== 'add' ? drawer.metric : null}
          onClose={handleCloseDrawer}
          onSave={handleSaveMetric}
          onDelete={(m) => { handleDeleteMetric(m); handleCloseDrawer(); }}
        />
      )}
    </div>
  );
}

// ─── Inline Badges ───────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Financial: 'bg-blue-50 text-blue-700',
    Operational: 'bg-amber-50 text-amber-700',
    Custom: 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const styles: Record<string, string> = {
    CRM: 'bg-emerald-50 text-emerald-700',
    Manual: 'bg-gray-100 text-gray-600',
    Calculated: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${styles[source] || 'bg-gray-100 text-gray-600'}`}>
      {source}
    </span>
  );
}

// ─── Column Header Filter (Excel-style) ─────────────────

function ColumnFilter({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    const scrollHandler = () => setOpen(false);
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', scrollHandler, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', scrollHandler, true);
    };
  }, [open]);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 2, left: rect.left });
    }
  }, [open]);

  return (
    <th className="text-left px-4 py-2.5">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
          value ? 'text-[#1a1a1a]' : 'text-[#666666] hover:text-[#333]'
        }`}
      >
        {value || label}
        {value ? (
          <X
            className="w-3 h-3 text-[#999891] hover:text-red-500"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          />
        ) : (
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-[#e2e0d8] rounded-md shadow-lg min-w-[120px] py-1"
          style={{ top: pos.top, left: pos.left }}
        >
          {value && (
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-[#999891] hover:bg-[#f9fafb] transition-colors"
            >
              All
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                value === opt
                  ? 'bg-[#1a1a1a]/5 text-[#1a1a1a] font-semibold'
                  : 'text-[#333] hover:bg-[#f9fafb]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </th>
  );
}
