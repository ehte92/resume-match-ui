import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/retroui/Button";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    navigate("/");
  };

  return (
    <header className="bg-white border-b-5 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
              className="font-display text-2xl font-extrabold text-primary-600 hover:text-primary-700 transition-colors"
            >
              ResumeMatch AI
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-foreground font-medium">
                  {user?.email}
                </span>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/signin")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/signup")}>Sign Up</Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
