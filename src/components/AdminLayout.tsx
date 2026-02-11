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
      <div className="px-4 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#4262FF] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold tracking-tight">A</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-[#111827] text-[13px] leading-tight tracking-tight">Admin Portal</h1>
            <p className="text-[11px] text-[#9ca3af] truncate leading-tight mt-0.5">{organizationConfig.displayName}</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-[#f3f4f6] transition-colors text-[#9ca3af] hover:text-[#111827]"
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
                      ? 'bg-[#4262FF]/[0.08] text-[#4262FF] font-medium'
                      : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]'
                    }
                  `}
                >
                  <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${isActive ? 'text-[#4262FF]' : 'text-[#9ca3af]'}`} />
                  <span>{item.label}</span>
                </NavLink>

                {/* Subnav */}
                {item.subnav && isActive && (
                  <div className="ml-[26px] mt-0.5 space-y-px border-l border-[#e5e7eb] pl-2.5">
                    {item.subnav.map((subitem) => {
                      const isSubActive = location.pathname === subitem.path;
                      return (
                        <NavLink
                          key={subitem.path}
                          to={subitem.path}
                          className={`
                            block px-2 py-[5px] rounded text-[12px] transition-all duration-150
                            ${isSubActive
                              ? 'text-[#4262FF] font-medium bg-[#4262FF]/[0.04]'
                              : 'text-[#9ca3af] hover:text-[#4b5563]'
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
      <div className="px-3 pb-3 pt-2 border-t border-[#e5e7eb]">
        <div className="bg-[#f8f9fb] rounded-lg p-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#9ca3af] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[12px] font-medium text-[#374151] leading-tight">Need help?</div>
              <a href="#" className="text-[11px] text-[#4262FF] hover:text-[#3451E6] transition-colors mt-0.5 inline-flex items-center gap-1">
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
    <div className="flex h-screen bg-[#f8f9fb]">
      {/* Mobile top bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#e5e7eb] px-3 py-2.5 flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md hover:bg-[#f3f4f6] transition-colors text-[#6b7280] hover:text-[#111827]"
            aria-label="Open sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#4262FF] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold">A</span>
            </div>
            <span className="font-semibold text-[#111827] text-[13px]">Admin Portal</span>
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
            fixed top-0 left-0 bottom-0 z-50 w-56 bg-white border-r border-[#e5e7eb] flex flex-col
            transform transition-transform duration-200 ease-in-out shadow-xl
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {sidebarContent}
        </aside>
      ) : (
        <aside className="w-56 bg-white border-r border-[#e5e7eb] flex flex-col flex-shrink-0">
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
