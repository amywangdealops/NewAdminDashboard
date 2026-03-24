import { Plus, Search, Filter, Package, MoreVertical, Edit, Trash2, Eye, Copy, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  type Product,
  type ProductFormData,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './productStore';
import { ProductFormDrawer } from './ProductFormDrawer';
import { ViewProductDrawer } from './ViewProductDrawer';

type DrawerState =
  | { type: 'closed' }
  | { type: 'add' }
  | { type: 'edit'; product: Product }
  | { type: 'duplicate'; product: Product }
  | { type: 'view'; product: Product };

interface ProductFilters {
  status: string;
  segment: string;
  category: string;
  pricingModel: string;
}

const EMPTY_FILTERS: ProductFilters = { status: '', segment: '', category: '', pricingModel: '' };

export function Products() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>({ type: 'closed' });

  // Load products from store on mount
  useEffect(() => {
    setProducts(listProducts());
  }, []);

  // ─── Handlers ──────────────────────────────────────────

  const handleAddProduct = () => {
    setDrawer({ type: 'add' });
  };

  const handleViewProduct = (product: Product) => {
    setDrawer({ type: 'view', product });
  };

  const handleEditProduct = (product: Product) => {
    setDrawer({ type: 'edit', product });
  };

  const handleDuplicateProduct = (product: Product) => {
    setDrawer({ type: 'duplicate', product });
  };

  const handleDeleteProduct = (product: Product) => {
    if (product.triggersCount > 0) {
      toast.error(`Cannot delete ${product.name}. It is used in ${product.triggersCount} trigger(s).`);
      return;
    }
    deleteProduct(product.id);
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast.success(`Product "${product.name}" deleted successfully`);
  };

  const handleCloseDrawer = () => {
    setDrawer({ type: 'closed' });
  };

  const handleSaveProduct = (data: ProductFormData) => {
    if (drawer.type === 'add' || drawer.type === 'duplicate') {
      const created = createProduct(data);
      setProducts(prev => [...prev, created]);
      toast.success(drawer.type === 'add' ? 'Product added' : 'Product duplicated');
    } else if (drawer.type === 'edit') {
      const updated = updateProduct(drawer.product.id, data);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast.success('Product updated');
    }
    setDrawer({ type: 'closed' });
  };

  const handleViewToEdit = (product: Product) => {
    setDrawer({ type: 'edit', product });
  };

  const handleViewTriggers = (productName: string, triggerCount: number) => {
    if (triggerCount > 0) {
      navigate('/triggers', { state: { filterProduct: productName } });
      toast.info(`Viewing triggers for ${productName}`);
    } else {
      toast.info(`${productName} is not used in any triggers`);
    }
  };

  const handleFilters = () => {
    setShowFilters(!showFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  // ─── Filtering ─────────────────────────────────────────

  const filteredProducts = products.filter(product => {
    if (filters.status && product.status !== filters.status) return false;
    if (filters.segment && product.segment !== filters.segment) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.pricingModel && product.pricingModel !== filters.pricingModel) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.segment.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.pricingModel.toLowerCase().includes(query)
    );
  });

  // ─── Format helpers ────────────────────────────────────

  const formatPrice = (product: Product) =>
    `$${product.price.toFixed(product.pricePrecision ?? 2)}`;

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e2e0d8] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#1a1a1a] tracking-tight">Products</h1>

          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999891]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:border-[#1a1a1a] focus:bg-white text-[12px] transition-all placeholder:text-[#999891]"
                aria-label="Search products"
              />
            </div>
            <button
              onClick={handleFilters}
              className={`h-8 px-2.5 border rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 ${
                activeFilterCount > 0
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]/5 text-[#1a1a1a]'
                  : 'border-[#e2e0d8] text-[#333333]'
              }`}
              aria-label="Filter products"
              aria-expanded={showFilters}
            >
              <Filter className={`w-3.5 h-3.5 ${activeFilterCount > 0 ? 'text-[#1a1a1a]' : 'text-[#999891]'}`} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[10px] flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
            <button
              onClick={handleAddProduct}
              className="h-8 px-3 bg-[#1a1a1a] text-white rounded-md hover:bg-[#333333] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 active:scale-[0.98]"
              aria-label="Add new product"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      {showFilters && (
        <div className="border-b border-[#e2e0d8] bg-[#f9fafb] px-6 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterSelect
              label="Status"
              value={filters.status}
              options={['Active', 'Inactive']}
              onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
            />
            <FilterSelect
              label="Segment"
              value={filters.segment}
              options={['Mid Market', 'Enterprise', 'Majors']}
              onChange={(v) => setFilters(prev => ({ ...prev, segment: v }))}
            />
            <FilterSelect
              label="Category"
              value={filters.category}
              options={['Add-ons', 'Core']}
              onChange={(v) => setFilters(prev => ({ ...prev, category: v }))}
            />
            <FilterSelect
              label="Pricing Model"
              value={filters.pricingModel}
              options={['Flat Fee Recurring', 'Consumption', 'Other']}
              onChange={(v) => setFilters(prev => ({ ...prev, pricingModel: v }))}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="h-7 px-2 text-[11px] text-[#999891] hover:text-[#333333] inline-flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e2e0d8] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#f9fafb] border-b border-[#e2e0d8]">
              <tr>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Product Name</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Segment</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Pricing Model</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Triggers</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#666666] uppercase tracking-wider">Status</th>
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Package className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                    <p className="text-[13px] font-medium text-[#333333]">
                      {searchQuery ? `No products found matching "${searchQuery}"` : 'No products found'}
                    </p>
                    <p className="text-[12px] text-[#999891] mt-0.5">
                      {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#1a1a1a] flex-shrink-0" aria-hidden="true" />
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[#666666]">{product.segment}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[#666666]">{product.pricingModel}</td>
                  <td className="px-4 py-2.5 text-[13px] font-medium text-[#1a1a1a] tabular-nums">{formatPrice(product)}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleViewTriggers(product.name, product.triggersCount)}
                      className="text-[#1a1a1a] hover:text-[#333333] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20 focus:ring-offset-1 rounded px-0.5 tabular-nums transition-colors"
                      aria-label={`View ${product.triggersCount} triggers using ${product.name}`}
                    >
                      {product.triggersCount}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                      product.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${product.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-[#999891] hover:text-[#333333] p-1 rounded-md hover:bg-[#f0efe9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/20"
                          aria-label={`Actions for ${product.name}`}
                          aria-haspopup="true"
                        >
                          <MoreVertical className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white border border-[#e2e0d8] shadow-lg rounded-lg">
                        <DropdownMenuItem
                          onClick={() => handleViewProduct(product)}
                          className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                        >
                          <Eye className="w-3.5 h-3.5 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditProduct(product)}
                          className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                        >
                          <Edit className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateProduct(product)}
                          className="cursor-pointer text-[13px] focus:bg-[#f9fafb]"
                        >
                          <Copy className="w-3.5 h-3.5 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product)}
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

      {/* Drawers */}
      {drawer.type === 'view' && (
        <ViewProductDrawer
          product={drawer.product}
          onClose={handleCloseDrawer}
          onEdit={handleViewToEdit}
        />
      )}

      {(drawer.type === 'add' || drawer.type === 'edit' || drawer.type === 'duplicate') && (
        <ProductFormDrawer
          mode={drawer.type}
          product={drawer.type !== 'add' ? drawer.product : null}
          onClose={handleCloseDrawer}
          onSave={handleSaveProduct}
          onDelete={(p) => { handleDeleteProduct(p); handleCloseDrawer(); }}
        />
      )}
    </div>
  );
}

// ─── Reusable Filter Select ─────────────────────────────

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
        onChange={(e) => onChange(e.target.value)}
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
      <svg className={`w-3 h-3 absolute right-1.5 pointer-events-none ${value ? 'text-white' : 'text-[#999891]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </div>
  );
}
