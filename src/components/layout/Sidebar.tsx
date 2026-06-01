'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, Package, Bell,
  CreditCard, BarChart3, Settings, ChevronLeft, ChevronRight,
  Sparkles, Truck, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/events', icon: Sparkles, label: 'Events' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/pickup', icon: Truck, label: 'Material Pickup' },
  { href: '/reminders', icon: Bell, label: 'Reminders' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/search', icon: Search, label: 'Search' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useApp();

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 flex flex-col',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">MK Brothers</p>
              <p className="text-xs text-gray-400 leading-tight">Event Decoration</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white',
            !sidebarOpen && 'hidden'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Toggle when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="p-2 mx-auto mt-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group',
                active
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                !sidebarOpen && 'justify-center px-2'
              )}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors',
            !sidebarOpen && 'justify-center'
          )}
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
