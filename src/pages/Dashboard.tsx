import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to optimize your resume for your next opportunity?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>New Analysis</CardTitle>
              <CardDescription>
                Upload your resume and compare it with a job description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full">
                Start New Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              {user?.full_name && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-gray-900">{user.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Member since</p>
                <p className="text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Past Analyses Section (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Your previous resume analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No analyses yet</p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Create your first analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
