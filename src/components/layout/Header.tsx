import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/retroui/Button";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b-5 border-black sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation(isAuthenticated ? "/dashboard" : "/")}
              className="font-display text-xl sm:text-2xl font-extrabold text-primary hover:text-primary-hover transition-colors"
            >
              ResumeMatch AI
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-foreground font-medium text-sm lg:text-base truncate max-w-[150px] lg:max-w-none">
                  {user?.email}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("/dashboard")}
                  size="sm"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("/resumes")}
                  size="sm"
                >
                  Resumes
                </Button>
                <Button onClick={handleLogout} size="sm">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleNavigation("/signin")} size="sm">
                  Sign In
                </Button>
                <Button onClick={() => handleNavigation("/signup")} size="sm">Sign Up</Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded border-2 border-black hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-black">
            <nav className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                    {user?.email}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation("/dashboard")}
                    className="w-full justify-start"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation("/resumes")}
                    className="w-full justify-start"
                  >
                    Resumes
                  </Button>
                  <Button onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleNavigation("/signin")}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button onClick={() => handleNavigation("/signup")} className="w-full">
                    Sign Up
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
