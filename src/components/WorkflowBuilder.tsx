import { ArrowLeft, Play, Save, Zap, Users, GitMerge, Filter, CheckCircle, Settings, Plus, Trash2, Copy, Link2, LayoutGrid, AlertCircle, BookOpen, Workflow } from 'lucide-react';
import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface WorkflowBuilderProps {
  workflow: any;
  onClose: () => void;
}

interface Node {
  id: string;
  type: 'trigger' | 'condition' | 'approver' | 'action' | 'parallel' | 'end';
  label: string;
  config?: any;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: 'approved' | 'rejected' | 'default';
}

const GRID_SIZE = 20;

function snapToGrid(x: number, y: number) {
  return [Math.round(x / GRID_SIZE) * GRID_SIZE, Math.round(y / GRID_SIZE) * GRID_SIZE];
}

function DraggableNode({ node, onSelect, isSelected, onMove, onDelete, onDuplicate, onConnect, isConnecting, connectingFrom }: any) {
  const [{ isDragging }, drag] = useDrag({
    type: 'node',
    item: { id: node.id, x: node.x, y: node.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [showActions, setShowActions] = useState(false);

  const getNodeStyle = () => {
    switch (node.type) {
      case 'trigger':
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-400 text-purple-900';
      case 'condition':
        return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 text-blue-900';
      case 'approver':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-400 text-emerald-900';
      case 'parallel':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400 text-amber-900';
      case 'action':
        return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-400 text-slate-900';
      case 'end':
        return 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 text-red-900';
      default:
        return 'bg-white border-slate-300 text-slate-900';
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case 'trigger':
        return <Zap className="w-4 h-4" />;
      case 'condition':
        return <Filter className="w-4 h-4" />;
      case 'approver':
        return <Users className="w-4 h-4" />;
      case 'parallel':
        return <GitMerge className="w-4 h-4" />;
      case 'action':
        return <Settings className="w-4 h-4" />;
      case 'end':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const hasValidation = node.config?.incomplete || node.config?.warning;

  return (
    <div
      ref={drag}
      onClick={(e) => {
        if (isConnecting) {
          onConnect(node.id);
        } else {
          onSelect(node);
        }
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
        opacity: isDragging ? 0.5 : 1,
        cursor: isConnecting ? 'crosshair' : 'move',
      }}
      className={`
        px-4 py-3 rounded-xl border-2 min-w-[200px] transition-all
        ${getNodeStyle()}
        ${isSelected ? 'ring-2 ring-purple-500 shadow-xl scale-105' : 'shadow-md'}
        ${isConnecting && connectingFrom !== node.id ? 'ring-2 ring-blue-400 animate-pulse' : ''}
        ${connectingFrom === node.id ? 'ring-2 ring-green-500' : ''}
        hover:shadow-xl relative
      `}
    >
      {/* Connection Ports */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-purple-400 rounded-full shadow-sm" 
           title="Input port" />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-purple-400 rounded-full shadow-sm" 
           title="Output port" />
      
      {/* Validation Warning */}
      {hasValidation && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center">
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Quick Actions */}
      {showActions && !isConnecting && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1">
          <button
            onClick={(e) => { e.stopPropagation(); onConnect(node.id); }}
            className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
            title="Connect to another node"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(node); }}
            className="p-1.5 hover:bg-slate-50 rounded text-slate-600"
            title="Duplicate node"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node); }}
            className="p-1.5 hover:bg-red-50 rounded text-red-600"
            title="Delete node"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-1">
        {getIcon()}
        <span className="text-xs font-semibold uppercase tracking-wide">{node.type}</span>
      </div>
      <div className="text-sm font-medium">{node.label}</div>
      {node.config?.summary && (
        <div className="text-xs mt-1 opacity-70">{node.config.summary}</div>
      )}
    </div>
  );
}

function Canvas({ nodes, onDrop, onSelectNode, selectedNodeId, connections, onUpdateConnection, isConnecting, connectingFrom, onNodeAction }: any) {
  const [, drop] = useDrop({
    accept: ['node', 'palette-item'],
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = document.getElementById('workflow-canvas')?.getBoundingClientRect();
      if (offset && canvasRect) {
        const [x, y] = snapToGrid(
          offset.x - canvasRect.left - 100,
          offset.y - canvasRect.top - 30
        );
        onDrop(item, x, y);
      }
    },
  });

  return (
    <div
      ref={drop}
      id="workflow-canvas"
      className="relative w-full h-full bg-slate-50"
      style={{
        backgroundImage: `
          linear-gradient(to right, #e2e8f0 1px, transparent 1px),
          linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
        `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    >
      {/* Connection Mode Overlay */}
      {isConnecting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          <span className="text-sm font-medium">
            {connectingFrom ? 'Click destination node to connect' : 'Click source node to start'}
          </span>
        </div>
      )}

      {/* Draw connections */}
      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
        <defs>
          {/* Different arrow markers for different connection types */}
          <marker id="arrowhead-approved" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
          </marker>
          <marker id="arrowhead-rejected" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
          </marker>
          <marker id="arrowhead-default" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
          </marker>
        </defs>
        {connections.map((conn: Connection) => {
          const fromNode = nodes.find((n: Node) => n.id === conn.from);
          const toNode = nodes.find((n: Node) => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + 100;
          const y1 = fromNode.y + 60;
          const x2 = toNode.x + 100;
          const y2 = toNode.y;

          const midY = (y1 + y2) / 2;
          
          const strokeColor = conn.type === 'approved' ? '#10b981' : conn.type === 'rejected' ? '#ef4444' : '#64748b';
          const markerEnd = `url(#arrowhead-${conn.type || 'default'})`;

          return (
            <g key={conn.id}>
              <path
                d={`M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`}
                stroke={strokeColor}
                strokeWidth="2"
                fill="none"
                markerEnd={markerEnd}
                className="hover:stroke-[3px]"
              />
              {/* Connection Label */}
              {conn.label && (
                <g>
                  <rect
                    x={x2 - 30}
                    y={midY - 10}
                    width={60}
                    height={20}
                    fill="white"
                    stroke={strokeColor}
                    strokeWidth="1"
                    rx="4"
                  />
                  <text
                    x={x2}
                    y={midY + 4}
                    textAnchor="middle"
                    className="text-xs font-medium"
                    fill={strokeColor}
                  >
                    {conn.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render nodes */}
      {nodes.map((node: Node) => (
        <DraggableNode
          key={node.id}
          node={node}
          onSelect={onSelectNode}
          isSelected={selectedNodeId === node.id}
          onMove={(x: number, y: number) => {}}
          onDelete={(n: Node) => onNodeAction('delete', n)}
          onDuplicate={(n: Node) => onNodeAction('duplicate', n)}
          onConnect={(id: string) => onNodeAction('connect', id)}
          isConnecting={isConnecting}
          connectingFrom={connectingFrom}
        />
      ))}

      {/* Helper text when empty */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-slate-400">
            <Workflow className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Start Building Your Workflow</p>
            <p className="text-sm">Drag a trigger from the left sidebar or choose a template below</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PaletteItem({ type, label, icon: Icon, description }: any) {
  const [{ isDragging }, drag] = useDrag({
    type: 'palette-item',
    item: { type, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`
        p-3 bg-white border-2 border-slate-200 rounded-lg cursor-move
        hover:border-purple-300 hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-purple-600" />
        <span className="font-medium text-sm text-slate-900">{label}</span>
      </div>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}

function Minimap({ nodes, selectedNodeId, onNodeClick }: any) {
  const scale = 0.1;
  const padding = 20;

  return (
    <div className="absolute bottom-4 right-4 w-48 h-32 bg-white border-2 border-slate-300 rounded-lg shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-slate-50">
        <svg width="100%" height="100%">
          {nodes.map((node: Node) => (
            <rect
              key={node.id}
              x={node.x * scale + padding / 2}
              y={node.y * scale + padding / 2}
              width={20}
              height={12}
              className={`cursor-pointer transition-all ${
                selectedNodeId === node.id ? 'fill-purple-600' : 'fill-slate-400 hover:fill-purple-400'
              }`}
              onClick={() => onNodeClick(node)}
              rx="2"
            />
          ))}
        </svg>
      </div>
      <div className="absolute bottom-1 right-1 text-[10px] text-slate-500 bg-white px-1 rounded">
        Minimap
      </div>
    </div>
  );
}

function WorkflowSummary({ nodes, connections }: any) {
  const generateSummary = () => {
    if (nodes.length === 0) return "No workflow steps defined yet.";
    
    const trigger = nodes.find((n: Node) => n.type === 'trigger');
    const approvers = nodes.filter((n: Node) => n.type === 'approver');
    const conditions = nodes.filter((n: Node) => n.type === 'condition');
    const endNode = nodes.find((n: Node) => n.type === 'end');

    let summary = [];
    
    if (trigger) {
      summary.push(`When ${trigger.label.toLowerCase()}`);
    }
    
    if (conditions.length > 0) {
      summary.push(`check if ${conditions.map((c: Node) => c.label.toLowerCase()).join(' and ')}`);
    }
    
    if (approvers.length > 0) {
      summary.push(`require approval from ${approvers.map((a: Node) => a.label).join(', then ')}`);
    }
    
    if (endNode) {
      summary.push(`then ${endNode.label.toLowerCase()}`);
    }

    return summary.join(', ') + '.';
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Workflow Summary</h3>
          <p className="text-sm text-blue-800 leading-relaxed">{generateSummary()}</p>
        </div>
      </div>
    </div>
  );
}

function TemplateLibrary({ onSelectTemplate, onClose }: any) {
  const templates = [
    {
      name: "Discount Approval",
      description: "Standard discount approval workflow for deals over 20%",
      nodes: [
        { id: '1', type: 'trigger', label: 'Discount > 20%', config: { summary: 'Any segment' }, x: 100, y: 80 },
        { id: '2', type: 'approver', label: 'Deal Desk', config: { summary: '2 approvals required' }, x: 100, y: 200 },
        { id: '3', type: 'end', label: 'Approve Deal', config: { summary: 'Send notification' }, x: 100, y: 320 },
      ],
      connections: [
        { id: 'c1', from: '1', to: '2', type: 'default' },
        { id: 'c2', from: '2', to: '3', type: 'approved' },
      ]
    },
    {
      name: "Regional Approval",
      description: "Different approvers based on customer region",
      nodes: [
        { id: '1', type: 'trigger', label: 'Custom Terms', config: { summary: 'Non-standard terms' }, x: 100, y: 60 },
        { id: '2', type: 'condition', label: 'Check Region', config: { summary: 'EMEA or APAC' }, x: 100, y: 180 },
        { id: '3', type: 'approver', label: 'Regional VP', config: { summary: '1 approval' }, x: 100, y: 300 },
        { id: '4', type: 'end', label: 'Auto-Approve', config: { summary: 'US deals only' }, x: 320, y: 300 },
      ],
      connections: [
        { id: 'c1', from: '1', to: '2', type: 'default' },
        { id: 'c2', from: '2', to: '3', type: 'approved', label: 'Yes' },
        { id: 'c3', from: '2', to: '4', type: 'rejected', label: 'No' },
      ]
    },
    {
      name: "Multi-Level Approval",
      description: "Sequential approval chain for large deals",
      nodes: [
        { id: '1', type: 'trigger', label: 'Deal > $100K', x: 100, y: 60 },
        { id: '2', type: 'approver', label: 'L1 Manager', x: 100, y: 180 },
        { id: '3', type: 'approver', label: 'L2 Director', x: 100, y: 300 },
        { id: '4', type: 'approver', label: 'VP Sales', x: 100, y: 420 },
        { id: '5', type: 'end', label: 'Approve Deal', x: 100, y: 540 },
      ],
      connections: [
        { id: 'c1', from: '1', to: '2', type: 'default' },
        { id: 'c2', from: '2', to: '3', type: 'approved' },
        { id: 'c3', from: '3', to: '4', type: 'approved' },
        { id: 'c4', from: '4', to: '5', type: 'approved' },
      ]
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Choose a Template</h2>
            <p className="text-sm text-slate-600 mt-1">Start with a pre-built workflow and customize it</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            ✕
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 gap-4">
          {templates.map((template, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectTemplate(template);
                onClose();
              }}
              className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer"
            >
              <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
              <p className="text-sm text-slate-600 mb-3">{template.description}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{template.nodes.length} steps</span>
                <span>•</span>
                <span>{template.connections.length} connections</span>
              </div>
            </div>
          ))}
          
          <div
            onClick={onClose}
            className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer text-center"
          >
            <Plus className="w-6 h-6 mx-auto text-slate-400 mb-2" />
            <h3 className="font-semibold text-slate-700">Start from Scratch</h3>
            <p className="text-sm text-slate-500 mt-1">Build your workflow from the ground up</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowBuilder({ workflow, onClose }: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'trigger', label: 'Discount > 20%', config: { summary: 'Any segment' }, x: 100, y: 80 },
    { id: '2', type: 'condition', label: 'Check Region', config: { summary: 'If EMEA or APAC' }, x: 100, y: 220 },
    { id: '3', type: 'approver', label: 'Deal Desk', config: { summary: '2 approvals required', incomplete: true }, x: 100, y: 360 },
    { id: '4', type: 'end', label: 'Approve Deal', config: { summary: 'Send notification' }, x: 100, y: 500 },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c1', from: '1', to: '2', type: 'default' },
    { id: 'c2', from: '2', to: '3', type: 'approved', label: 'Yes' },
    { id: 'c3', from: '3', to: '4', type: 'approved' },
  ]);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showProperties, setShowProperties] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const handleDrop = (item: any, x: number, y: number) => {
    if (item.type === 'node') {
      setNodes(nodes.map(n => n.id === item.id ? { ...n, x, y } : n));
    } else {
      const newNode: Node = {
        id: Date.now().toString(),
        type: item.type,
        label: item.label,
        x,
        y,
      };
      setNodes([...nodes, newNode]);
    }
  };

  const handleNodeAction = (action: string, target: any) => {
    if (action === 'delete') {
      setNodes(nodes.filter(n => n.id !== target.id));
      setConnections(connections.filter(c => c.from !== target.id && c.to !== target.id));
      if (selectedNode?.id === target.id) setSelectedNode(null);
    } else if (action === 'duplicate') {
      const newNode = { ...target, id: Date.now().toString(), x: target.x + 40, y: target.y + 40 };
      setNodes([...nodes, newNode]);
    } else if (action === 'connect') {
      if (!isConnecting) {
        setIsConnecting(true);
        setConnectingFrom(target);
      } else if (connectingFrom && connectingFrom !== target) {
        const newConnection: Connection = {
          id: Date.now().toString(),
          from: connectingFrom,
          to: target,
          type: 'default',
        };
        setConnections([...connections, newConnection]);
        setIsConnecting(false);
        setConnectingFrom(null);
      }
    }
  };

  const handleAutoLayout = () => {
    const sorted = [...nodes].sort((a, b) => {
      if (a.type === 'trigger') return -1;
      if (b.type === 'trigger') return 1;
      if (a.type === 'end') return 1;
      if (b.type === 'end') return -1;
      return 0;
    });

    const layoutNodes = sorted.map((node, idx) => ({
      ...node,
      x: 100,
      y: 80 + idx * 140,
    }));

    setNodes(layoutNodes);
  };

  const handleSelectTemplate = (template: any) => {
    setNodes(template.nodes);
    setConnections(template.connections);
  };

  const paletteItems = [
    { type: 'trigger', label: 'Trigger', icon: Zap, description: 'Start when conditions are met' },
    { type: 'condition', label: 'Condition', icon: Filter, description: 'Add if/then logic' },
    { type: 'approver', label: 'Approver', icon: Users, description: 'Require approval' },
    { type: 'parallel', label: 'Parallel', icon: GitMerge, description: 'Split approval paths' },
    { type: 'action', label: 'Action', icon: Settings, description: 'Automated action' },
    { type: 'end', label: 'End', icon: CheckCircle, description: 'Complete workflow' },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {workflow ? `Edit: ${workflow.name}` : 'New Approval Workflow'}
                </h1>
                <p className="text-sm text-slate-600 mt-0.5">Drag components or use quick actions on nodes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <BookOpen className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={handleAutoLayout}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <LayoutGrid className="w-4 h-4" />
                Auto-Layout
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                <Play className="w-4 h-4" />
                Test
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Palette */}
          <aside className="w-64 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Components</h2>
              <p className="text-xs text-slate-600 mb-4">Drag onto canvas</p>
            </div>
            <div className="space-y-3">
              {paletteItems.map((item) => (
                <PaletteItem key={item.type} {...item} />
              ))}
            </div>

            <div className="mt-6">
              <WorkflowSummary nodes={nodes} connections={connections} />
            </div>

            <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-xs font-semibold text-purple-900 mb-2">💡 Quick Tips</h3>
              <ul className="text-xs text-purple-800 space-y-1.5">
                <li>• Hover nodes for quick actions</li>
                <li>• Click <Link2 className="w-3 h-3 inline" /> to connect nodes</li>
                <li>• Use Auto-Layout to organize</li>
                <li>• Check minimap to navigate</li>
              </ul>
            </div>
          </aside>

          {/* Center - Canvas */}
          <div className="flex-1 overflow-auto relative">
            <Canvas
              nodes={nodes}
              connections={connections}
              onDrop={handleDrop}
              onSelectNode={setSelectedNode}
              selectedNodeId={selectedNode?.id}
              onUpdateConnection={() => {}}
              isConnecting={isConnecting}
              connectingFrom={connectingFrom}
              onNodeAction={handleNodeAction}
            />
            <Minimap nodes={nodes} selectedNodeId={selectedNode?.id} onNodeClick={setSelectedNode} />
          </div>

          {/* Right Sidebar - Properties */}
          {showProperties && (
            <aside className="w-80 border-l border-slate-200 bg-white overflow-y-auto">
              {selectedNode ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Node Settings</h2>
                  </div>

                  {selectedNode.config?.incomplete && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        <div className="font-medium">Configuration incomplete</div>
                        <div className="mt-1">Please select an approval group</div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Node Type</label>
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                      {selectedNode.type === 'trigger' && <Zap className="w-4 h-4" />}
                      {selectedNode.type === 'condition' && <Filter className="w-4 h-4" />}
                      {selectedNode.type === 'approver' && <Users className="w-4 h-4" />}
                      {selectedNode.type}
                    </span>
                  </div>

                  <div className="mb-6">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Label</label>
                    <input
                      type="text"
                      value={selectedNode.label}
                      onChange={(e) => {
                        setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, label: e.target.value } : n));
                        setSelectedNode({ ...selectedNode, label: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {selectedNode.type === 'approver' && (
                    <>
                      <div className="mb-6">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Approval Group</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">Select group...</option>
                          <option>Deal Desk</option>
                          <option>L1 Approvers</option>
                          <option>L2 Approvers</option>
                          <option>VP of Sales</option>
                        </select>
                      </div>
                      <div className="mb-6">
                        <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Required Approvals</label>
                        <input type="number" min="1" defaultValue="1" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a node to edit properties</p>
                  <p className="text-xs mt-2">Or hover nodes for quick actions</p>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Bottom Toolbar */}
        <footer className="border-t border-slate-200 px-6 py-3 bg-slate-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-slate-600">
              <span>{nodes.length} nodes</span>
              <span>{connections.length} connections</span>
              {selectedNode && <span className="text-purple-600 font-medium">• {selectedNode.label} selected</span>}
              {isConnecting && <span className="text-blue-600 font-medium animate-pulse">• Connection mode active</span>}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-xs">Tip: Hover nodes for quick actions</span>
            </div>
          </div>
        </footer>
      </div>

      {showTemplates && (
        <TemplateLibrary onSelectTemplate={handleSelectTemplate} onClose={() => setShowTemplates(false)} />
      )}
    </DndProvider>
  );
}
