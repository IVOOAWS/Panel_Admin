'use client';

import React from "react"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/admin/sidebar';
import { SidebarProvider, useSidebarContext } from '@/context/sidebar-context';
import { ThemeProvider } from '@/context/theme-context';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobileOpen, setIsMobileOpen } = useSidebarContext();
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen bg-background dark:bg-slate-950 flex-col md:flex-row">
      <Sidebar />
      <main className={`flex-1 overflow-auto bg-background dark:bg-slate-950 w-full flex flex-col ${isMobileOpen ? 'hidden md:block' : 'block'}`}>
        {/* Mobile Menu Button - Solo visible en mobile */}
        <div className="md:hidden p-4 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}
