import { Plus, Search, Filter, Package, MoreVertical, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Products() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([
    { id: 1, name: "API (per user)", segment: "Mid Market", category: "Add-ons", pricing: "Flat Fee Recurring", currency: "USD", price: "$30", status: "Active", triggers: 2 },
    { id: 2, name: "Basic Service Module", segment: "Mid Market", category: "Core", pricing: "Consumption", currency: "USD", price: "$30", status: "Active", triggers: 5 },
    { id: 3, name: "Custom Product", segment: "Enterprise", category: "Add-ons", pricing: "Other", currency: "USD", price: "$30", status: "Active", triggers: 3 },
  ]);

  const handleAddProduct = () => {
    toast.info('Add Product functionality coming soon');
  };

  const handleViewTriggers = (productName: string, triggerCount: number) => {
    if (triggerCount > 0) {
      navigate('/triggers', { state: { filterProduct: productName } });
      toast.info(`Viewing triggers for ${productName}`);
    } else {
      toast.info(`${productName} is not used in any triggers`);
    }
  };

  const handleViewProduct = (product: typeof products[0]) => {
    toast.info(`Viewing details for ${product.name}`);
  };

  const handleEditProduct = (product: typeof products[0]) => {
    toast.info(`Editing ${product.name}`);
  };

  const handleDuplicateProduct = (product: typeof products[0]) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id), 0) + 1,
      name: `${product.name} (Copy)`
    };
    setProducts([...products, newProduct]);
    toast.success(`Product "${newProduct.name}" duplicated successfully`);
  };

  const handleDeleteProduct = (product: typeof products[0]) => {
    if (product.triggers > 0) {
      toast.error(`Cannot delete ${product.name}. It is used in ${product.triggers} trigger(s).`);
      return;
    }
    setProducts(products.filter(p => p.id !== product.id));
    toast.success(`Product "${product.name}" deleted successfully`);
  };

  const handleFilters = () => {
    setShowFilters(!showFilters);
    toast.info('Filter options coming soon');
  };

  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.segment.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.pricing.toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-[#e5e7eb] bg-white px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#111827] tracking-tight">Products</h1>
            <p className="text-[#9ca3af] text-[12px] mt-0.5">Manage products and pricing models in your catalog</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 bg-[#f5f6f8] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] focus:bg-white text-[12px] transition-all placeholder:text-[#9ca3af]"
                aria-label="Search products"
              />
            </div>
            <button
              onClick={handleFilters}
              className="h-8 px-2.5 border border-[#e5e7eb] rounded-md hover:bg-[#f9fafb] inline-flex items-center gap-1.5 text-[#374151] text-[12px] font-medium transition-colors whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
              aria-label="Filter products"
            >
              <Filter className="w-3.5 h-3.5 text-[#9ca3af]" />
              Filters
            </button>
            <button
              onClick={handleAddProduct}
              className="h-8 px-3 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] inline-flex items-center gap-1.5 text-[12px] font-medium transition-all shadow-sm whitespace-nowrap flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 active:scale-[0.98]"
              aria-label="Add new product"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Product Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Product Name</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Segment</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Pricing Model</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Triggers</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Status</th>
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Package className="w-10 h-10 text-[#e5e7eb] mx-auto mb-2" />
                    <p className="text-[13px] font-medium text-[#374151]">
                      {searchQuery ? `No products found matching "${searchQuery}"` : 'No products found'}
                    </p>
                    <p className="text-[12px] text-[#9ca3af] mt-0.5">
                      {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#4262FF] flex-shrink-0" aria-hidden="true" />
                      <span className="text-[13px] font-medium text-[#111827]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[#6b7280]">{product.segment}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[#6b7280]">{product.pricing}</td>
                  <td className="px-4 py-2.5 text-[13px] font-medium text-[#111827] tabular-nums">{product.price}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleViewTriggers(product.name, product.triggers)}
                      className="text-[#4262FF] hover:text-[#3451E6] text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:ring-offset-1 rounded px-0.5 tabular-nums transition-colors"
                      aria-label={`View ${product.triggers} triggers using ${product.name}`}
                    >
                      {product.triggers}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium">
                      <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="text-[#9ca3af] hover:text-[#374151] p-1 rounded-md hover:bg-[#f3f4f6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20"
                          aria-label={`Actions for ${product.name}`}
                          aria-haspopup="true"
                        >
                          <MoreVertical className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-white border border-[#e5e7eb] shadow-lg rounded-lg">
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
    </div>
  );
}
