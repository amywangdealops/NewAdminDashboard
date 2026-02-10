import { Plus, Search, Filter, Download, Upload } from 'lucide-react';

export function DealConfiguration() {
  const products = [
    { name: "API (per user)", segment: "Mid Market Non Law Firms", category: "Add-ons", pricing: "Flat Fee Recurring", currency: "USD", price: "$30", status: "Active" },
    { name: "API (per user)", segment: "Mid Market Law Firms", category: "Add-ons", pricing: "Flat Fee Recurring", currency: "USD", price: "$30", status: "Active" },
    { name: "Basic Service Module", segment: "Mid Market Law Firms", category: "Core", pricing: "Consumption", currency: "USD", price: "$30", status: "Active" },
    { name: "Custom Product", segment: "Mid Market Law Firms", category: "Add-ons", pricing: "Other", currency: "USD", price: "$30", status: "Active" },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-[#e1e4e8] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#050038]">Products & Pricing</h1>
            <p className="text-[#6c757d] mt-1 text-sm">Manage products, pricing models, and catalog structure</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] flex items-center gap-2 text-[#050038] text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="px-4 py-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] flex items-center gap-2 text-[#050038] text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" />
            <input
              type="text"
              placeholder="Search products by name, segment, or category..."
              className="w-full pl-10 pr-4 py-2.5 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all"
            />
          </div>
          <button className="px-4 py-2.5 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] flex items-center gap-2 text-[#050038] text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </header>

      {/* Product Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-lg border border-[#e1e4e8] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e1e4e8]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Product Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Segment</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Pricing Model</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Currency</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">List Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-[#6c757d] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1e4e8]">
              {products.map((product, idx) => (
                <tr key={idx} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#050038]">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-[#6c757d]">{product.segment}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-[#e3f2fd] text-[#1565c0] rounded text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6c757d]">{product.pricing}</td>
                  <td className="px-6 py-4 text-sm text-[#6c757d]">{product.currency}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#050038]">{product.price}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded text-xs font-medium">
                      {product.status}
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
      </div>
    </div>
  );
}