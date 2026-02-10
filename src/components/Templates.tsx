import { Layers, Copy } from 'lucide-react';

export function Templates() {
  const templates = [
    {
      name: "High discount requires Sales Manager",
      description: "Standard approval for discounts above 20%",
      category: "Pricing & Discounts",
      uses: 45
    },
    {
      name: "Extended payment terms require Finance",
      description: "Approval needed for Net 60 or Net 90 terms",
      category: "Contract Terms",
      uses: 32
    },
    {
      name: "Auto-renewal off requires Legal",
      description: "Legal review when auto-renewal is disabled",
      category: "Subscription Changes",
      uses: 18
    },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="border-b border-[#e1e4e8] px-8 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#050038]">Templates & Defaults</h1>
          <p className="text-[#6c757d] mt-1 text-sm">
            Pre-built approval trigger templates you can clone and customize
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((template, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-[#e1e4e8] p-5 hover:shadow-md hover:border-[#4262FF]/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-[#4262FF] mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#050038] mb-1">{template.name}</h3>
                    <p className="text-sm text-[#6c757d]">{template.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#e1e4e8]">
                <div className="text-xs text-[#6c757d]">
                  Used by {template.uses} companies
                </div>
                <button className="px-3 py-1.5 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] flex items-center gap-2 text-[#050038] text-xs font-medium transition-colors">
                  <Copy className="w-3 h-3" />
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
