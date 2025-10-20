import { useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  FileText,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isPrimary?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
    isPrimary: true,
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
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white z-50 flex flex-col transition-all duration-300',
          // Neobrutalism: Bold right border with sharp shadow
          'border-r-2 border-black',
          'shadow-[4px_0_0_0_#000000]',
          isCollapsed ? 'w-20' : 'w-60',
          // Mobile: slide in from left
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section - Minimal */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b-2 border-black',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!isCollapsed ? (
            <>
              <h1 className="font-display text-xl font-bold text-foreground">
                ResumeMatch
              </h1>
              {/* Mobile Close Button */}
              <button
                onClick={onMobileClose}
                className="lg:hidden p-1 hover:bg-background rounded transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="font-display text-2xl font-bold text-primary">R</div>
          )}
        </div>

        {/* Navigation - Minimal with whitespace */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 transition-all duration-200',
                      // Minimal: No borders on default, only active state
                      'border-2',
                      isCollapsed && 'justify-center',
                      // Active state: Bold left border
                      active
                        ? 'border-l-4 border-y-0 border-r-0 border-primary bg-gray-50'
                        : 'border-transparent',
                      // Primary CTA: Yellow background with neobrutalism
                      item.isPrimary && !active
                        ? 'bg-secondary border-black shadow-[3px_3px_0_0_#000] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#000]'
                        : !active && 'hover:bg-gray-50'
                    )}
                    aria-label={item.label}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className={cn(
                      'flex-shrink-0',
                      active ? 'text-primary' : item.isPrimary ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className={cn(
                        'text-sm font-medium',
                        active ? 'text-primary' : 'text-foreground'
                      )}>
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section - Minimal at bottom */}
        <div className="border-t-2 border-black">
          {/* User Info Button */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors',
              isCollapsed && 'justify-center'
            )}
            aria-label="User menu"
          >
            {/* Avatar Circle */}
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary border-2 border-black flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {getUserInitials()}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && !isCollapsed && (
            <div className="border-t-2 border-black bg-gray-50">
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsUserMenuOpen(false);
                  if (onMobileClose) onMobileClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive hover:text-white transition-colors border-t border-gray-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}

          {/* Collapsed user menu */}
          {isUserMenuOpen && isCollapsed && (
            <div className="absolute bottom-16 left-20 bg-white border-2 border-black shadow-lg rounded overflow-hidden min-w-[200px]">
              <div className="px-4 py-3 border-b-2 border-black bg-gray-50">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setIsUserMenuOpen(false);
                  if (onMobileClose) onMobileClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-background transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive hover:text-white transition-colors border-t border-gray-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}

          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden lg:flex w-full items-center gap-3 px-4 py-3 border-t-2 border-black hover:bg-gray-50 transition-colors',
              isCollapsed && 'justify-center'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="flex-shrink-0">
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </span>
            {!isCollapsed && (
              <span className="text-sm text-muted-foreground">Collapse</span>
            )}
          </button>
        </div>
      </aside>

      {/* Floating Mobile Menu Button */}
      {!isMobileOpen && (
        <button
          onClick={onMobileClose ? () => {} : undefined}
          className="lg:hidden fixed bottom-6 right-6 h-14 w-14 bg-primary text-white border-2 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000] rounded-full flex items-center justify-center z-40 transition-all"
          aria-label="Open menu"
          style={{ display: 'none' }} // Hidden for now, can be enabled if needed
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  );
};
