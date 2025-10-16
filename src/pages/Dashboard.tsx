import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/retroui/Button';
import { Card } from '@/components/retroui/Card';

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
          <Card>
            <Card.Header>
              <Card.Title>New Analysis</Card.Title>
              <Card.Description>
                Upload your resume and compare it with a job description
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <Button onClick={() => navigate('/')} className="w-full">
                Start New Analysis
              </Button>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Account Info</Card.Title>
              <Card.Description>Your account details</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-2">
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
            </Card.Content>
          </Card>
        </div>

        {/* Past Analyses Section (Placeholder) */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Analyses</Card.Title>
            <Card.Description>Your previous resume analyses</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No analyses yet</p>
              <Button variant="outline" onClick={() => navigate('/')}>
                Create your first analysis
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};
