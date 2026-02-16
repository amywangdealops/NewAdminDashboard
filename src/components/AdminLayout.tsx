import { Outlet, NavLink, useLocation } from 'react-router';
import { Package, Shield, Users, Layers, BarChart3, HelpCircle, Menu, X, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { organizationConfig } from '../config/organization';
import { useIsMobile } from './ui/use-mobile';

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
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navItems: NavItem[] = [
    { path: "/", label: "Products", icon: Package },
    {
      path: "/triggers",
      label: "Approval Triggers",
      icon: Shield,
      subnav: [
        { path: "/triggers/pricing", label: "Product Discounts" },
        { path: "/triggers/terms", label: "Commercial Terms" },
        { path: "/triggers/custom", label: "Custom Triggers" },
      ]
    },
    { path: "/approvers", label: "Approvers & Groups", icon: Users },
    { path: "/templates", label: "Templates & Defaults", icon: Layers },
    { path: "/reporting", label: "Reporting", icon: BarChart3 },
  ];

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#e2e0d8] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold tracking-tight">A</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-medium text-[#1a1a1a] text-[13px] leading-tight tracking-tight">Admin Portal</h1>
            <p className="text-[11px] text-[#999891] truncate leading-tight mt-0.5">{organizationConfig.displayName}</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-[#f0efe9] transition-colors text-[#999891] hover:text-[#1a1a1a]"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center gap-2.5 px-2.5 py-[7px] rounded-md transition-all duration-150 text-[13px]
                    ${isActive
                      ? 'bg-[#1a1a1a]/[0.06] text-[#1a1a1a] font-medium'
                      : 'text-[#666666] hover:bg-[#f0efe9] hover:text-[#1a1a1a]'
                    }
                  `}
                >
                  <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${isActive ? 'text-[#1a1a1a]' : 'text-[#999891]'}`} />
                  <span>{item.label}</span>
                </NavLink>

                {/* Subnav */}
                {item.subnav && isActive && (
                  <div className="ml-[26px] mt-0.5 space-y-px border-l border-[#e2e0d8] pl-2.5">
                    {item.subnav.map((subitem) => {
                      const isSubActive = location.pathname === subitem.path;
                      return (
                        <NavLink
                          key={subitem.path}
                          to={subitem.path}
                          className={`
                            block px-2 py-[5px] rounded text-[12px] transition-all duration-150
                            ${isSubActive
                              ? 'text-[#1a1a1a] font-medium bg-[#1a1a1a]/[0.04]'
                              : 'text-[#999891] hover:text-[#666666]'
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
        </div>
      </nav>

      {/* Help Section */}
      <div className="px-3 pb-3 pt-2 border-t border-[#e2e0d8]">
        <div className="bg-[#f5f4f0] rounded-lg p-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#999891] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[12px] font-medium text-[#1a1a1a] leading-tight">Need help?</div>
              <a href="#" className="text-[11px] text-[#666666] hover:text-[#1a1a1a] transition-colors mt-0.5 inline-flex items-center gap-1">
                Contact support
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f7f7f5]">
      {/* Mobile top bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#e2e0d8] px-3 py-2.5 flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-[#f0efe9] transition-colors text-[#666666] hover:text-[#1a1a1a]"
            aria-label="Open sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold">A</span>
            </div>
            <span className="font-medium text-[#1a1a1a] text-[13px]">Admin Portal</span>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      {isMobile ? (
        <aside
          className={`
            fixed top-0 left-0 bottom-0 z-50 w-56 bg-white border-r border-[#e2e0d8] flex flex-col
            transform transition-transform duration-200 ease-in-out shadow-xl
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {sidebarContent}
        </aside>
      ) : (
        <aside className="w-56 bg-white border-r border-[#e2e0d8] flex flex-col flex-shrink-0">
          {sidebarContent}
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-[45px]' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
