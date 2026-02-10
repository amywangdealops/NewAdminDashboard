import { Outlet, NavLink, useLocation } from 'react-router';
import { Package, Shield, Users, Layers, BarChart3, HelpCircle } from 'lucide-react';

interface SubNavItem {
  path: string;
  label: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: any;
  subnav?: SubNavItem[];
}

export function AdminLayout() {
  const location = useLocation();

  const navItems: NavItem[] = [
    { path: "/", label: "Products", icon: Package },
    { 
      path: "/triggers", 
      label: "Approval Triggers", 
      icon: Shield,
      subnav: [
        { path: "/triggers/pricing", label: "Pricing & Discounts" },
        { path: "/triggers/terms", label: "Contract Terms" },
        { path: "/triggers/subscriptions", label: "Subscription Changes" },
        { path: "/triggers/custom", label: "Custom Triggers" },
      ]
    },
    { path: "/approvers", label: "Approvers & Groups", icon: Users },
    { path: "/templates", label: "Templates & Defaults", icon: Layers },
    { path: "/reporting", label: "Reporting", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#e1e4e8] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#e1e4e8]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#4262FF] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div>
              <h1 className="font-semibold text-[#050038] text-sm">Admin Portal</h1>
              <p className="text-xs text-[#6c757d]">Harvey 2.0</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.path);
            
            return (
              <div key={item.path} className="mb-1">
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm
                    ${isActive 
                      ? 'bg-[#f0f4ff] text-[#4262FF]' 
                      : 'text-[#050038] hover:bg-[#f8f9fa]'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4262FF]' : 'text-[#6c757d]'}`} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
                
                {/* Subnav */}
                {item.subnav && isActive && (
                  <div className="ml-7 mt-1 space-y-0.5">
                    {item.subnav.map((subitem) => {
                      const isSubActive = location.pathname === subitem.path;
                      return (
                        <NavLink
                          key={subitem.path}
                          to={subitem.path}
                          className={`
                            block px-3 py-1.5 rounded text-xs transition-colors
                            ${isSubActive 
                              ? 'text-[#4262FF] font-medium' 
                              : 'text-[#6c757d] hover:text-[#050038]'
                            }
                          `}
                        >
                          {subitem.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="p-3 border-t border-[#e1e4e8]">
          <div className="bg-[#f8f9fa] rounded-lg p-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#6c757d] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#050038]">
                <div className="font-medium mb-1">Need help?</div>
                <div className="text-[#6c757d]">Contact support team</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}