import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  Star, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Users,
  CheckCircle,
<<<<<<< HEAD
  AlertCircle,
  Menu,
  X
=======
  AlertCircle
>>>>>>> 91618263e2cde560237368da5db3e3b3df6a4081
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_type: 'client' | 'designer';
  full_name: string;
  email: string;
  bio?: string;
  skills?: string[];
  hourly_rate?: number;
  portfolio_url?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
=======
>>>>>>> 91618263e2cde560237368da5db3e3b3df6a4081
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEarnings: 0,
    avgRating: 0,
    responseTime: '2h'
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Check if email is verified and show recommendation
      if (!user.email_confirmed_at) {
        toast({
          title: "Email Verification Recommended",
          description: "Verify your email to receive project updates and important notifications.",
          variant: "default",
        });
      }

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from('user_profiles_2025_09_30_12_43')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
      } else {
        setProfile(profileData);
      }

      // Fetch real stats from database
      await fetchRealStats(user.id, profileData?.user_type);

    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealStats = async (userId, userType) => {
    try {
      // Fetch real project statistics
      const { data: projects, error } = await supabase
        .from('projects_2025_10_04_12_00')
        .select('*')
        .or(`client_id.eq.${userId},designer_id.eq.${userId}`);

      if (error) {
        console.error('Error fetching projects:', error);
        // Set default stats if error
        setStats({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalEarnings: 0,
          avgRating: 0,
          responseTime: 'N/A'
        });
        return;
      }

      const totalProjects = projects?.length || 0;
      const activeProjects = projects?.filter(p => ['in_progress', 'pending_approval', 'revision_requested'].includes(p.status)).length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
      
      // Calculate total earnings for designers
      let totalEarnings = 0;
      if (userType === 'designer') {
        const completedDesignerProjects = projects?.filter(p => p.status === 'completed' && p.designer_id === userId) || [];
        totalEarnings = completedDesignerProjects.reduce((sum, project) => sum + (project.budget * 0.9), 0); // 90% after 10% platform fee
      }

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalEarnings,
        avgRating: 0, // Would need ratings table
        responseTime: 'N/A' // Would need response time tracking
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalEarnings: 0,
        avgRating: 0,
        responseTime: 'N/A'
      });
    }
  };

  const switchToDesigner = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles_2025_09_30_12_43')
        .update({ user_type: 'designer' })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Switched to Designer",
        description: "You can now access designer features and apply to projects.",
      });

      // Refresh the page to update the dashboard
      window.location.reload();
    } catch (error) {
      console.error('Error switching to designer:', error);
      toast({
        title: "Switch Failed",
        description: "Failed to switch to designer mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isDesigner = profile?.user_type === 'designer';

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url('./images/design_bg_2.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="./images/IMG-20250419-WA0166-removebg-preview (1).png" 
              alt="FTG Logo" 
              className="h-8 w-auto"
            />
            <div>
              <p className="font-semibold text-primary">designmatch</p>
              <p className="text-xs text-muted-foreground">by FTG</p>
            </div>
          </div>
<<<<<<< HEAD
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button variant="ghost" onClick={() => navigate('/projects')}>Projects</Button>
            <Button variant="ghost" onClick={() => navigate('/messages')}>Messages</Button>
            <Button variant="ghost" onClick={() => navigate('/profile')}>Profile</Button>
            <Button variant="ghost" onClick={() => navigate('/settings')}>Settings</Button>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation Sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border/50 z-50">
            <div className="container mx-auto px-4 py-6 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  navigate('/projects');
                  setMobileMenuOpen(false);
                }}
              >
                Projects
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  navigate('/messages');
                  setMobileMenuOpen(false);
                }}
              >
                Messages
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
              >
                Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  navigate('/settings');
                  setMobileMenuOpen(false);
                }}
              >
                Settings
              </Button>
              <div className="pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
=======
          <nav className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>Projects</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>Messages</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>Profile</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>Settings</Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign Out</Button>
          </nav>
        </div>
>>>>>>> 91618263e2cde560237368da5db3e3b3df6a4081
      </header>

      <div className="relative z-10 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {profile?.full_name || 'User'}! 👋
                </h1>
                <p className="text-muted-foreground">
                  {isDesigner ? 'Manage your design projects and grow your business' : 'Find talented designers for your projects'}
                </p>
              </div>
              <Badge variant={isDesigner ? 'default' : 'secondary'} className="text-sm">
                {isDesigner ? '🎨 Designer' : '👤 Client'}
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isDesigner ? 'Total Projects' : 'Posted Projects'}
                    </p>
                    <p className="text-2xl font-bold text-primary">{stats.totalProjects}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-green-500">{stats.activeProjects}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.completedProjects}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isDesigner ? 'Total Earnings' : 'Total Spent'}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ${isDesigner ? stats.totalEarnings : stats.totalProjects * 500}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Recent Projects</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isDesigner ? (
                      <>
                        <Button className="w-full justify-start" onClick={() => navigate('/profile')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Update Portfolio
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/projects')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Available Projects
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Check Messages
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full justify-start" onClick={() => navigate('/find-designers')}>
                          <Users className="h-4 w-4 mr-2" />
                          Find Designers
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/projects')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Post New Project
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Messages
                        </Button>
                        <Button 
                          variant="secondary" 
                          className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary" 
                          onClick={switchToDesigner}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Switch to Designer
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Summary - Only for Designers */}
                {isDesigner && (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Profile Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Profile Completion</span>
                        <Badge variant="outline">
                          {profile?.bio && profile?.skills ? '100%' : '75%'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Average Rating</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{stats.avgRating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/profile')}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Projects</h3>
                <Button onClick={() => navigate('/projects')}>
                  View All Projects
                </Button>
              </div>
              
              {/* Projects - Empty State */}
              <div className="space-y-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No projects yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {isDesigner 
                          ? "Start applying to projects to see them here" 
                          : "Post your first project to get started"
                        }
                      </p>
                      <Button onClick={() => navigate('/projects')}>
                        {isDesigner ? 'Browse Projects' : 'Post New Project'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              
              <div className="space-y-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No recent activity</h3>
                      <p className="text-sm text-muted-foreground">
                        Your recent activities will appear here once you start using the platform
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;