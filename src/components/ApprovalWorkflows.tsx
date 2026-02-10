import { Plus, Search, Play, Eye, GitBranch, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { WorkflowBuilder } from './WorkflowBuilder';

export function ApprovalWorkflows() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

  const workflows = [
    { name: "Discount Approval - Enterprise", trigger: "Discount > 20%", steps: 3, status: "Active", coverage: "82%", issues: 0 },
    { name: "Term Modification - Mid Market", trigger: "Payment terms ≠ Net 30", steps: 2, status: "Active", coverage: "94%", issues: 2 },
    { name: "Price Lock - Beyond Service Term", trigger: "Price lock requested", steps: 4, status: "Draft", coverage: "0%", issues: 1 },
    { name: "Custom Product - All Segments", trigger: "Product type = Custom", steps: 3, status: "Active", coverage: "100%", issues: 0 },
  ];

  if (showBuilder) {
    return <WorkflowBuilder workflow={selectedWorkflow} onClose={() => setShowBuilder(false)} />;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-[#e1e4e8] px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#050038]">Approval Workflows</h1>
            <p className="text-[#6c757d] mt-1 text-sm">Build and manage approval chains visually</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] flex items-center gap-2 text-[#050038] text-sm font-medium transition-colors">
              <Play className="w-4 h-4" />
              Test Workflow
            </button>
            <button 
              onClick={() => {
                setSelectedWorkflow(null);
                setShowBuilder(true);
              }}
              className="px-4 py-2 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6c757d]" />
          <input
            type="text"
            placeholder="Search workflows..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#e1e4e8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4262FF]/20 focus:border-[#4262FF] text-sm transition-all"
          />
        </div>
      </header>

      {/* Workflow List */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="space-y-3">
          {workflows.map((workflow, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-[#e1e4e8] p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <GitBranch className="w-4 h-4 text-[#4262FF]" />
                    <h3 className="font-semibold text-[#050038] text-sm">{workflow.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      workflow.status === "Active" 
                        ? "bg-[#e8f5e9] text-[#2e7d32]" 
                        : "bg-[#f5f5f5] text-[#6c757d]"
                    }`}>
                      {workflow.status}
                    </span>
                    {workflow.issues > 0 && (
                      <span className="px-2 py-0.5 bg-[#ffebee] text-[#c62828] rounded-full text-xs font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {workflow.issues}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <div className="text-xs text-[#6c757d] mb-1">Trigger Condition</div>
                      <div className="text-[#050038] font-mono text-xs bg-[#f8f9fa] px-2 py-1 rounded">
                        {workflow.trigger}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6c757d] mb-1">Approval Steps</div>
                      <div className="text-[#050038]">{workflow.steps} sequential</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6c757d] mb-1">Coverage</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#e1e4e8] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${parseInt(workflow.coverage) > 90 ? 'bg-[#4caf50]' : 'bg-[#ff9800]'}`}
                            style={{ width: workflow.coverage }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#050038]">{workflow.coverage}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-6">
                  <button className="p-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#6c757d] transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#6c757d] transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setShowBuilder(true);
                    }}
                    className="px-4 py-2 border border-[#e1e4e8] rounded-md hover:bg-[#f8f9fa] text-[#050038] text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Workflow Builder Preview */}
        <div className="mt-8 bg-[#f8f9fa] rounded-lg border border-[#e1e4e8] p-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#4262FF] rounded-lg flex items-center justify-center mx-auto mb-4">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#050038] mb-2">Visual Workflow Builder</h3>
            <p className="text-[#6c757d] mb-6 max-w-md mx-auto text-sm">
              Drag and drop to create complex approval chains with conditional logic and parallel approvers.
            </p>
            <button 
              onClick={() => {
                setSelectedWorkflow(null);
                setShowBuilder(true);
              }}
              className="px-6 py-2.5 bg-[#4262FF] text-white rounded-md hover:bg-[#3451E6] font-medium text-sm transition-colors shadow-sm"
            >
              Launch Builder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}