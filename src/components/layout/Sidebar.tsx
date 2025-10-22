import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  FileText,
  LogOut,
  X,
  Sparkles,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tooltip } from '@/components/retroui/Tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/dashboard',
  },
  {
    id: 'new-analysis',
    label: 'New Analysis',
    icon: <PlusCircle className="h-5 w-5" />,
    path: '/new-analysis',
  },
  {
    id: 'resumes',
    label: 'My Resumes',
    icon: <FolderOpen className="h-5 w-5" />,
    path: '/resumes',
  },
  {
    id: 'cover-letters',
    label: 'Cover Letters',
    icon: <FileText className="h-5 w-5" />,
    path: '/cover-letters',
  },
];

export const Sidebar = ({
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out');
    navigate('/');
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <Tooltip.Provider delayDuration={300}>
        <aside
          className={cn(
            'fixed top-0 left-0 h-full bg-white z-50 flex flex-col',
            'border-r-2 border-black',
            // Desktop: collapsed (w-20), Mobile: fullscreen (w-full)
            'w-full lg:w-20',
            // Mobile: slide in from left
            'transition-transform duration-300 ease-in-out',
            'lg:translate-x-0',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Logo Section - Desktop Only */}
          <div className="hidden lg:flex items-center justify-center h-16 px-4 border-b-2 border-black">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            {/* Mobile Close Button */}
            <div className="lg:hidden flex justify-end mb-4 px-1">
              <button
                onClick={onMobileClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.id}>
                    {/* Desktop: Show tooltip */}
                    <Tooltip>
                      <Tooltip.Trigger asChild>
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                            // Desktop: center icons
                            'lg:justify-center',
                            active
                              ? 'bg-primary/10 text-primary border-l-4 border-primary'
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                          aria-label={item.label}
                        >
                          <span className="flex-shrink-0">
                            {item.icon}
                          </span>
                          {/* Mobile: show label */}
                          <span className="text-sm font-medium lg:hidden">
                            {item.label}
                          </span>
                        </button>
                      </Tooltip.Trigger>
                      {/* Only show tooltip on desktop */}
                      <Tooltip.Content
                        side="right"
                        className="hidden lg:block"
                        variant="solid"
                      >
                        {item.label}
                      </Tooltip.Content>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="border-t-2 border-black p-4">
            {/* Desktop: Avatar, Settings, Logout with tooltips */}
            <div className="hidden lg:flex flex-col items-center space-y-3">
              {/* Avatar */}
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <div className="h-10 w-10 rounded-full bg-primary border-2 border-black flex items-center justify-center cursor-pointer">
                    <span className="text-white text-sm font-bold">
                      {getUserInitials()}
                    </span>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Content side="right" variant="solid">
                  <div className="text-xs">
                    <div className="font-medium">{user?.full_name || 'User'}</div>
                    <div className="text-gray-300">{user?.email}</div>
                  </div>
                </Tooltip.Content>
              </Tooltip>

              {/* Settings */}
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => handleNavigation('/settings')}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isActive('/settings')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                    aria-label="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="right" variant="solid">
                  Settings
                </Tooltip.Content>
              </Tooltip>

              {/* Logout */}
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="right" variant="solid">
                  Logout
                </Tooltip.Content>
              </Tooltip>
            </div>

            {/* Mobile: Full user section */}
            <div className="lg:hidden space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary border-2 border-black flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {getUserInitials()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Settings Button */}
              <button
                onClick={() => handleNavigation('/settings')}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border border-gray-300',
                  isActive('/settings')
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                )}
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg transition-colors border border-gray-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>
      </Tooltip.Provider>
    </>
  );
};
