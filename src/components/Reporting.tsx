import { BarChart3 } from 'lucide-react';

export function Reporting() {
  return (
    <div className="h-full flex flex-col bg-white">
      <header className="border-b border-[#e1e4e8] px-8 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#050038]">Reporting</h1>
          <p className="text-[#6c757d] mt-1 text-sm">
            View approval performance, bottlenecks, and trigger impact
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-[#e1e4e8] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#050038] mb-2">
            Reporting Dashboard
          </h3>
          <p className="text-[#6c757d]">
            View detailed analytics and performance metrics
          </p>
        </div>
      </div>
    </div>
  );
}
