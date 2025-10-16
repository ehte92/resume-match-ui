import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/retroui/Button';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name || user?.email}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ready to optimize your resume for your next opportunity?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
            {/* Colored Header Section */}
            <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
              <h3 className="text-xl font-bold text-foreground">New Analysis</h3>
              <p className="text-foreground/80 text-sm mt-1">
                Upload your resume and compare it with a job description
              </p>
            </div>

            {/* White Content Section */}
            <div className="p-6 bg-white">
              <Button onClick={() => navigate('/')} className="w-full">
                Start New Analysis
              </Button>
            </div>
          </div>

          <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
            {/* Colored Header Section */}
            <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
              <h3 className="text-xl font-bold text-foreground">Account Info</h3>
              <p className="text-foreground/80 text-sm mt-1">Your account details</p>
            </div>

            {/* White Content Section */}
            <div className="p-6 bg-white space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{user?.email}</p>
              </div>
              {user?.full_name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-foreground">{user.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member since</p>
                <p className="text-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Past Analyses Section (Placeholder) */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Colored Header Section */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
            <h3 className="text-xl font-bold text-foreground">Recent Analyses</h3>
            <p className="text-foreground/80 text-sm mt-1">Your previous resume analyses</p>
          </div>

          {/* White Content Section */}
          <div className="p-6 bg-white">
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No analyses yet</p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Create your first analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
