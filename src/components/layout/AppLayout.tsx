import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export const AppLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* Floating Mobile Menu Button */}
      {!isMobileSidebarOpen && (
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden fixed bottom-6 right-6 p-4 bg-primary text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] rounded-full z-30 transition-all"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Main Content */}
      <main className="min-h-screen lg:ml-20 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};
