'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, darkMode } = useApp();

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', darkMode && 'dark')}>
      <Sidebar />
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
