import React from 'react';
import { ChevronLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  sidebarItems?: Array<{
    href: string;
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
  }>;
  headerActions?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  description,
  sidebarItems = [],
  headerActions,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-canvas">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 md:hidden bg-black/50"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } z-40 md:z-0`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-surface font-display font-bold">
              F
            </div>
            <div>
              <p className="font-semibold text-primary">ForestView</p>
              <p className="text-xs text-neutral-600">Admin</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  item.active
                    ? 'bg-primary text-surface shadow-md'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-ink'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-surface border-b border-line px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
              <div>
                {title && (
                  <h1 className="text-2xl font-display font-bold text-ink">{title}</h1>
                )}
                {description && (
                  <p className="text-sm text-neutral-600 mt-1">{description}</p>
                )}
              </div>
            </div>
            {headerActions && <div className="ml-auto">{headerActions}</div>}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
