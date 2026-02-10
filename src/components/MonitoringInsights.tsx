import { Activity, AlertTriangle, Code, Eye, TrendingUp, Clock } from 'lucide-react';

export function MonitoringInsights() {
  const recentExecutions = [
    { 
      timestamp: "2026-02-10 14:32", 
      dealId: "DEAL-2847", 
      ruleTriggered: "Billing Frequency → Deal Desk (Expansion)", 
      approver: "Deal Desk", 
      outcome: "Approved", 
      duration: "2.3h",
    },
    { 
      timestamp: "2026-02-10 13:18", 
      dealId: "DEAL-2846", 
      ruleTriggered: "Custom Product → L2", 
      approver: "Miles Zimmerman", 
      outcome: "Pending", 
      duration: "1.2h",
    },
    { 
      timestamp: "2026-02-10 11:45", 
      dealId: "DEAL-2845", 
      ruleTriggered: "Price Lock → VP of Sales", 
      approver: "VP of Sales", 
      outcome: "Approved", 
      duration: "3.4h",
    },
    { 
      timestamp: "2026-02-10 09:22", 
      dealId: "DEAL-2843", 
      ruleTriggered: "Payment Terms → Deal Desk", 
      approver: "Spyri Karasavva", 
      outcome: "Approved", 
      duration: "4.1h",
    },
  ];

  const hiddenRules = [
    { name: "Expansion Logic - Same Billing Frequency", reason: "Cross-field comparison not supported in admin", impactLevel: "High" },
    { name: "Price Lock - Beyond Service Term", reason: "Complex conditional logic (within vs beyond)", impactLevel: "Critical" },
    { name: "VP Approval - Non-Mid-Market", reason: "Segment negation logic", impactLevel: "Medium" },
    { name: "Parallel Approvers - Deal Desk + Accounting", reason: "Parallel execution model", impactLevel: "High" },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Approval Activity</h1>
          <p className="text-slate-600 mt-1">Track approval performance and identify bottlenecks</p>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Rule Executions */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Approvals
            </h2>
            <div className="space-y-3">
              {recentExecutions.map((execution, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium text-slate-900">{execution.dealId}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          execution.outcome === "Approved" 
                            ? "bg-emerald-50 text-emerald-700"
                            : execution.outcome === "Pending"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {execution.outcome}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{execution.timestamp}</div>
                    </div>
                    <button className="p-1 hover:bg-slate-100 rounded">
                      <Eye className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="text-sm text-slate-900 font-medium mb-1">{execution.ruleTriggered}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Approver: <span className="font-medium text-slate-900">{execution.approver}</span></span>
                    <span className="text-slate-600">Time: <span className="font-medium text-slate-900">{execution.duration}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Trends */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Performance Trends
            </h2>
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="text-sm text-slate-600 mb-3">Approval Volume by Day</div>
                <div className="flex items-end gap-2 h-32">
                  {[42, 38, 51, 45, 47, 52, 48].map((height, idx) => (
                    <div key={idx} className="flex-1 bg-purple-100 rounded-t relative" style={{ height: `${height}%` }}>
                      <div className="absolute -top-6 left-0 right-0 text-center text-xs text-slate-600">{Math.round(height * 0.8)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="text-sm text-slate-600 mb-3">Approval Time Distribution</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">Under 2 hours</span>
                      <span className="font-medium text-slate-900">34%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '34%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">2-6 hours</span>
                      <span className="font-medium text-slate-900">48%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">Over 6 hours</span>
                      <span className="font-medium text-slate-900">18%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Impact Analysis */}
        <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Rule Impact Analysis (Last 30 Days)</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-2">Most Triggered Rules</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Payment Terms → Deal Desk</span>
                  <span className="font-medium text-purple-600">234</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Billing Frequency → Deal Desk</span>
                  <span className="font-medium text-purple-600">189</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Custom Product → L2</span>
                  <span className="font-medium text-purple-600">156</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Slowest Approvals</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">VP of Sales Approval</span>
                  <span className="font-medium text-amber-600">8.4h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Head of Mid-Market</span>
                  <span className="font-medium text-amber-600">6.2h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Deal Desk (2 required)</span>
                  <span className="font-medium text-amber-600">5.1h</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Highest Rejection Rate</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Price Lock Rules</span>
                  <span className="font-medium text-red-600">18%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Custom Pricing</span>
                  <span className="font-medium text-red-600">12%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-900">Large Discounts</span>
                  <span className="font-medium text-red-600">9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}