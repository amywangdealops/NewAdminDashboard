import { Plus, Search, FileText, Copy, Trash2, ChevronUp, ChevronDown, X, GripVertical } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  type Term,
  type TermFormData,
  listTerms,
  createTerm,
  updateTerm,
  deleteTerm,
  reorderTerms,
} from './termStore';
import { TermFormDrawer } from './TermFormDrawer';

const TERM_DND_TYPE = 'TERM_ROW';

type DrawerState =
  | { type: 'closed' }
  | { type: 'add' }
  | { type: 'edit'; term: Term }
  | { type: 'duplicate'; term: Term };

interface TermFilters {
  status: string;
  category: string;
  inputType: string;
}

const EMPTY_FILTERS: TermFilters = { status: '', category: '', inputType: '' };

type SortField = 'segments';
type SortDir = 'asc' | 'desc';

export function TermsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TermFilters>(EMPTY_FILTERS);
  const [terms, setTerms] = useState<Term[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>({ type: 'closed' });
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    setTerms(listTerms());
  }, []);

  const handleAddTerm = () => setDrawer({ type: 'add' });
  const handleEditTerm = (term: Term) => setDrawer({ type: 'edit', term });
  const handleDuplicateTerm = (term: Term) => setDrawer({ type: 'duplicate', term });

  const handleDeleteTerm = (term: Term) => {
    deleteTerm(term.id);
    setTerms(prev => prev.filter(t => t.id !== term.id));
    toast.success(`Term "${term.name}" deleted`);
  };

  const handleCloseDrawer = () => setDrawer({ type: 'closed' });

  const handleSaveTerm = (data: TermFormData) => {
    if (drawer.type === 'add' || drawer.type === 'duplicate') {
      const created = createTerm(data);
      setTerms(prev => [...prev, created]);
      toast.success(drawer.type === 'add' ? 'Term added' : 'Term duplicated');
    } else if (drawer.type === 'edit') {
      const updated = updateTerm(drawer.term.id, data);
      setTerms(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success('Term updated');
    }
    setDrawer({ type: 'closed' });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasSearch = searchQuery.trim().length > 0;
  const hasFilters = activeFilterCount > 0;
  const hasSortOverride = sortField !== null;
  const reorderDisabled = hasSearch || hasFilters || hasSortOverride;

  // ─── Reorder logic ─────────────────────────────────────

  const moveRow = useCallback((dragIndex: number, hoverIndex: number) => {
    setTerms(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, moved);
      return next;
    });
  }, []);

  const commitOrder = useCallback(() => {
    setTerms(current => {
      reorderTerms(current.map(t => t.id));
      return current;
    });
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setTerms(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      reorderTerms(next.map(t => t.id));
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setTerms(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      reorderTerms(next.map(t => t.id));
      return next;
    });
  }, []);

  // ─── Filtering & sorting ───────────────────────────────

  const filteredTerms = terms.filter(term => {
    if (filters.status && term.status !== filters.status) return false;
    if (filters.category && term.category !== filters.category) return false;
    if (filters.inputType && term.inputType !== filters.inputType) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      term.name.toLowerCase().includes(query) ||
      term.category.toLowerCase().includes(query) ||
      term.inputType.toLowerCase().includes(query)
    );
  });

  const displayTerms = [...filteredTerms].sort((a, b) => {
    if (!sortField) return 0;
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'segments': {
        const aS = a.segments.length === 0 ? 'All segments' : a.segments.join(', ');
        const bS = b.segments.length === 0 ? 'All segments' : b.segments.join(', ');
        return aS.localeCompare(bS) * dir;
      }
      default:
        return 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-0 group-hover:opacity-40 inline-flex"><ChevronUp className="w-3 h-3" /></span>;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 ml-0.5 inline" />
      : <ChevronDown className="w-3 h-3 ml-0.5 inline" />;
  };

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Terms Library</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
                aria-label="Search terms"
              />
            </div>
            <AddTermSplitButton
              onNewBlank={handleAddTerm}
              onCloneFrom={handleDuplicateTerm}
              terms={terms}
            />
          </div>
        </div>
      </header>

      {/* Terms Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
                <tr>
                  <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider w-[100px]">
                    Order
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                    Term Name
                  </th>
                  <th
                    className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider cursor-pointer select-none group"
                    onClick={() => handleSort('segments')}
                  >
                    Segments <SortIcon field="segments" />
                  </th>
                  <ColumnFilter
                    label="Category"
                    value={filters.category}
                    options={['Core Terms', 'Custom Terms']}
                    onChange={(v) => setFilters(prev => ({ ...prev, category: v }))}
                  />
                  <ColumnFilter
                    label="Input Type"
                    value={filters.inputType}
                    options={['Date', 'Select', 'Number', 'Text', 'Select With Other']}
                    onChange={(v) => setFilters(prev => ({ ...prev, inputType: v }))}
                  />
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                    Options
                  </th>
                  <ColumnFilter
                    label="Status"
                    value={filters.status}
                    options={['On', 'Off']}
                    onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                  />
                  <th className="px-3 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f1f4]">
                {displayTerms.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <FileText className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                      <p className="text-[13px] font-medium text-[#333333]">
                        {searchQuery ? `No terms found matching "${searchQuery}"` : 'No terms found'}
                      </p>
                      <p className="text-[12px] text-[#999891] mt-0.5">
                        {searchQuery ? 'Try a different search term' : 'Add your first term to get started'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayTerms.map((term, index) => {
                    const realIndex = terms.findIndex(t => t.id === term.id);
                    return (
                      <DraggableTermRow
                        key={term.id}
                        term={term}
                        index={realIndex}
                        displayIndex={index}
                        totalCount={displayTerms.length}
                        disabled={reorderDisabled}
                        onMove={moveRow}
                        onDrop={commitOrder}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                        onEdit={handleEditTerm}
                        onDuplicate={handleDuplicateTerm}
                        onDelete={handleDeleteTerm}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {reorderDisabled && displayTerms.length > 0 && (
          <p className="text-[11px] text-[#999891] mt-2 text-center">
            {hasSortOverride
              ? 'Clear column sort to drag-reorder'
              : 'Clear search/filters to drag-reorder'}
          </p>
        )}
      </div>

      {/* Drawer */}
      {(drawer.type === 'add' || drawer.type === 'edit' || drawer.type === 'duplicate') && (
        <TermFormDrawer
          mode={drawer.type}
          term={drawer.type !== 'add' ? drawer.term : null}
          onClose={handleCloseDrawer}
          onSave={handleSaveTerm}
          onDelete={(t) => { handleDeleteTerm(t); handleCloseDrawer(); }}
        />
      )}
    </div>
    </DndProvider>
  );
}

// ─── Draggable Term Row ──────────────────────────────────

interface DraggableTermRowProps {
  term: Term;
  index: number;
  displayIndex: number;
  totalCount: number;
  disabled: boolean;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onDrop: () => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (term: Term) => void;
  onDuplicate: (term: Term) => void;
  onDelete: (term: Term) => void;
}

interface DragItem {
  type: string;
  index: number;
  id: number;
}

function DraggableTermRow({
  term, index, displayIndex, totalCount, disabled,
  onMove, onDrop, onMoveUp, onMoveDown,
  onEdit, onDuplicate, onDelete,
}: DraggableTermRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: TERM_DND_TYPE,
    item: (): DragItem => ({ type: TERM_DND_TYPE, index, id: term.id }),
    canDrag: () => !disabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      onDrop();
    },
  });

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: TERM_DND_TYPE,
    canDrop: () => !disabled,
    hover(item, monitor) {
      if (!rowRef.current) return;
      const dragIdx = item.index;
      const hoverIdx = index;
      if (dragIdx === hoverIdx) return;

      const hoverBoundingRect = rowRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIdx < hoverIdx && hoverClientY < hoverMiddleY) return;
      if (dragIdx > hoverIdx && hoverClientY > hoverMiddleY) return;

      onMove(dragIdx, hoverIdx);
      item.index = hoverIdx;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  preview(drop(rowRef));

  const isFirst = displayIndex === 0;
  const isLast = displayIndex === totalCount - 1;

  return (
    <tr
      ref={rowRef}
      className={`transition-all cursor-pointer group/row ${
        isDragging
          ? 'opacity-40 bg-[#f5f4f0]'
          : isOver && canDrop
            ? 'bg-[#f0efe9]'
            : 'hover:bg-[#f9fafb]'
      }`}
      onClick={() => onEdit(term)}
    >
      {/* Order cell: drag handle + position + arrows */}
      <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <div
            ref={disabled ? undefined : drag}
            className={`p-0.5 rounded transition-colors ${
              disabled
                ? 'text-[#e2e0d8] cursor-default'
                : 'text-[#999891] hover:text-[#666666] hover:bg-[#f0efe9] cursor-grab active:cursor-grabbing'
            }`}
            title={disabled ? 'Clear filters/sort to reorder' : 'Drag to reorder'}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] text-[#666666] tabular-nums w-5 text-center">{displayIndex + 1}</span>
          <div className="flex flex-col -space-y-px ml-0.5">
            <button
              onClick={() => onMoveUp(index)}
              disabled={disabled || isFirst}
              className={`p-0 leading-none transition-colors rounded ${
                disabled || isFirst
                  ? 'text-[#e2e0d8] cursor-default'
                  : 'text-[#999891] hover:text-[#1a1a1a] hover:bg-[#f0efe9]'
              }`}
              aria-label="Move up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveDown(index)}
              disabled={disabled || isLast}
              className={`p-0 leading-none transition-colors rounded ${
                disabled || isLast
                  ? 'text-[#e2e0d8] cursor-default'
                  : 'text-[#999891] hover:text-[#1a1a1a] hover:bg-[#f0efe9]'
              }`}
              aria-label="Move down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <span className="text-[13px] font-medium text-[#1a1a1a]">{term.name}</span>
      </td>
      <td className="px-4 py-2.5 text-[13px] text-[#666666]">
        {term.segments.length === 0 ? 'All segments' : term.segments.join(', ')}
      </td>
      <td className="px-4 py-2.5 text-[13px] font-medium text-[#1a1a1a]">
        {term.category}
      </td>
      <td className="px-4 py-2.5 text-[13px] text-[#666666]">
        {term.inputType}
      </td>
      <td className="px-4 py-2.5 text-[13px] text-[#666666] max-w-[200px]">
        <span className="truncate block">
          {term.options.length > 0 ? term.options.join(', ') : '-'}
        </span>
      </td>
      <td className="px-4 py-2.5">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
          term.status === 'On'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          <span className={`w-1 h-1 rounded-full ${term.status === 'On' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
          {term.status}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onDuplicate(term)}
            className="p-1 text-[#999891] hover:text-[#333333] rounded-md hover:bg-[#f0efe9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
            aria-label={`Clone ${term.name}`}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(term)}
            className="p-1 text-[#999891] hover:text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
            aria-label={`Delete ${term.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Split Button: + Term / Clone From ───────────────────

const INPUT_TYPE_COLORS: Record<string, string> = {
  'Date': 'bg-violet-50 text-violet-700',
  'Select': 'bg-blue-50 text-blue-700',
  'Number': 'bg-amber-50 text-amber-700',
  'Text': 'bg-gray-100 text-gray-600',
  'Select With Other': 'bg-cyan-50 text-cyan-700',
};

function AddTermSplitButton({ onNewBlank, onCloneFrom, terms }: {
  onNewBlank: () => void;
  onCloneFrom: (term: Term) => void;
  terms: Term[];
}) {
  const [open, setOpen] = useState(false);
  const [cloneSearch, setCloneSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCloneSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  const filtered = terms.filter(t =>
    t.name.toLowerCase().includes(cloneSearch.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-stretch">
        <button
          onClick={onNewBlank}
          className="h-8 pl-3 pr-2.5 bg-[#1a1a1a] text-white rounded-l-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
          aria-label="Add new blank term"
        >
          <Plus className="w-3.5 h-3.5" />
          Term
        </button>
        <button
          onClick={() => { setOpen(!open); setCloneSearch(''); }}
          className="h-8 px-1.5 bg-[#1a1a1a] text-white rounded-r-md hover:bg-[#333333] border-l border-white/20 inline-flex items-center transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
          aria-label="More term creation options"
          aria-expanded={open}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-[#e2e0d8] rounded-lg shadow-xl z-50 overflow-hidden">
          <button
            onClick={() => { onNewBlank(); setOpen(false); }}
            className="w-full text-left px-3.5 py-2.5 hover:bg-[#f9fafb] transition-colors flex items-center gap-3 border-b border-[#f0f1f4]"
          >
            <div className="w-7 h-7 rounded-md bg-[#f5f6f8] border border-[#e2e0d8] flex items-center justify-center flex-shrink-0">
              <Plus className="w-3.5 h-3.5 text-[#666666]" />
            </div>
            <div>
              <span className="text-[13px] font-medium text-[#1a1a1a]">New blank term</span>
              <p className="text-[11px] text-[#999891]">Start from scratch</p>
            </div>
          </button>

          <div className="px-3.5 pt-3 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Copy className="w-3 h-3 text-[#999891]" />
              <span className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Clone from existing</span>
            </div>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                ref={searchInputRef}
                type="text"
                value={cloneSearch}
                onChange={(e) => setCloneSearch(e.target.value)}
                placeholder="Search terms to clone..."
                className="w-full h-7 pl-7 pr-3 bg-[#f5f6f8] border border-transparent rounded-md text-[11px] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:bg-white focus:border-[#1a1a1a] transition-all placeholder:text-[#999891]"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto pb-1.5 px-1.5">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-[12px] text-[#999891] text-center">No terms match your search</div>
            ) : (
              filtered.map(term => (
                <button
                  key={term.id}
                  onClick={() => { onCloneFrom(term); setOpen(false); setCloneSearch(''); }}
                  className="w-full text-left px-2.5 py-2 rounded-md hover:bg-[#f5f4f0] transition-colors flex items-center gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[#1a1a1a] truncate">{term.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${INPUT_TYPE_COLORS[term.inputType] ?? 'bg-gray-100 text-gray-600'}`}>
                        {term.inputType}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#999891]">{term.category}</span>
                      <span className="text-[10px] text-[#e2e0d8]">&middot;</span>
                      <span className="text-[10px] text-[#999891]">
                        {term.segments.length === 0 ? 'All segments' : term.segments.join(', ')}
                      </span>
                    </div>
                  </div>
                  <Copy className="w-3 h-3 text-[#999891] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
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
