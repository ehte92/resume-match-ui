import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Floating Mobile Menu Button - Only visible on mobile when sidebar is closed */}
      <button
        onClick={toggleMobileSidebar}
        className={cn(
          'lg:hidden fixed bottom-6 right-6 p-4 bg-primary text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] rounded-full z-30 transition-all',
          isMobileSidebarOpen && 'hidden'
        )}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Main Content - No header, starts from top */}
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          // Desktop: adjust for sidebar
          'lg:ml-60',
          isSidebarCollapsed && 'lg:ml-20'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};
