import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Key, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AuthDebug = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("testpass123");
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("checking");
  const [apiKeyStatus, setApiKeyStatus] = useState("checking");
  const [connectionTest, setConnectionTest] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      // Test basic Supabase connection
      const { data, error } = await supabase.rpc('debug_auth_status');
      if (error) throw error;
      
      setConnectionTest({ success: true, data });
      setApiKeyStatus("working");
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionTest({ success: false, error: error.message });
      setApiKeyStatus("failed");
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setSession(session);
      setUser(session?.user || null);
      setAuthStatus(session ? "authenticated" : "not_authenticated");
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus("error");
    }
  };

  const testSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: "Test User",
            user_type: 'client'
          }
        }
      });

      if (error) throw error;

      const debugInfo = {
        userCreated: !!data.user,
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: !!data.user?.email_confirmed_at,
        confirmationSentAt: data.user?.confirmation_sent_at,
        createdAt: data.user?.created_at
      };

      setDebugInfo(debugInfo);

      toast({
        title: "Sign Up Test Result",
        description: `User created: ${data.user ? 'Yes' : 'No'}, Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`,
      });

      console.log('Signup result:', data);
      console.log('Debug info:', debugInfo);
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      console.error('Signup error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) throw error;

      const debugInfo = {
        signInSuccessful: !!data.user,
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: !!data.user?.email_confirmed_at,
        sessionExists: !!data.session,
        accessToken: data.session?.access_token ? 'Present' : 'Missing'
      };

      setDebugInfo(debugInfo);

      toast({
        title: "Sign In Test Result",
        description: `Successfully signed in as ${data.user?.email}`,
      });

      console.log('Signin result:', data);
      console.log('Debug info:', debugInfo);
      checkAuthStatus();
    } catch (error: any) {
      const debugInfo = {
        signInFailed: true,
        errorMessage: error.message,
        errorCode: error.status,
        errorDetails: error
      };

      setDebugInfo(debugInfo);

      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      console.error('Signin error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to check",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('check_user_status', { user_email: testEmail });
      if (error) throw error;

      setDebugInfo({ userStatus: data });
      toast({
        title: "User Status Check",
        description: `User exists: ${data.exists ? 'Yes' : 'No'}`,
      });
    } catch (error: any) {
      toast({
        title: "Status Check Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmUser = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to confirm",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('confirm_user_by_email', { user_email: testEmail });
      if (error) throw error;

      setDebugInfo({ confirmResult: data });
      
      if (data.success) {
        toast({
          title: "User Confirmed!",
          description: `${testEmail} has been confirmed and should now be able to sign in.`,
        });
      } else {
        toast({
          title: "Confirmation Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Signed Out",
        description: "Successfully signed out",
      });

      checkAuthStatus();
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
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
        </div>
      </header>

      <div className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Authentication Debug</h1>
            <p className="text-muted-foreground">
              Test authentication functionality and debug login issues
            </p>
          </div>

          {/* Current Auth Status */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Current Authentication Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Auth Status:</span>
                <div className="flex items-center">
                  {authStatus === "authenticated" ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className={authStatus === "authenticated" ? "text-green-500" : "text-red-500"}>
                    {authStatus}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>API Connection:</span>
                <div className="flex items-center">
                  {apiKeyStatus === "working" ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : apiKeyStatus === "failed" ? (
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  )}
                  <span className={
                    apiKeyStatus === "working" ? "text-green-500" : 
                    apiKeyStatus === "failed" ? "text-red-500" : "text-yellow-500"
                  }>
                    {apiKeyStatus}
                  </span>
                </div>
              </div>

              {connectionTest && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Connection Test:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(connectionTest, null, 2)}
                  </pre>
                </div>
              )}
              
              {user && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Confirmed:</span>
                    <span>{user.email_confirmed_at ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>User ID:</span>
                    <span className="text-xs">{user.id}</span>
                  </div>
                </>
              )}

              <Button onClick={checkAuthStatus} variant="outline" size="sm">
                Refresh Status
              </Button>
            </CardContent>
          </Card>

          {/* Test Authentication */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Test Authentication</CardTitle>
              <CardDescription>
                Test signup and signin functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-password">Test Password</Label>
                  <Input
                    id="test-password"
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="testpass123"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={testSignUp} 
                  disabled={loading}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Test Sign Up
                </Button>
                <Button 
                  onClick={testSignIn} 
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Test Sign In
                </Button>
                {user && (
                  <Button 
                    onClick={testSignOut} 
                    variant="destructive"
                    className="flex-1"
                  >
                    Sign Out
                  </Button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button 
                  onClick={checkUserStatus} 
                  variant="secondary"
                  className="flex-1"
                >
                  Check User Status
                </Button>
                <Button 
                  onClick={confirmUser} 
                  variant="secondary"
                  className="flex-1"
                >
                  Confirm User
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p><strong>Instructions for Login Issues:</strong></p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li><strong>Check User Status</strong> - Enter your email and click to see if user exists</li>
                  <li><strong>Confirm User</strong> - If user exists but can't login, click to confirm them</li>
                  <li><strong>Test Sign In</strong> - Try signing in after confirmation</li>
                  <li><strong>Check Debug Info</strong> - View detailed information below</li>
                </ol>
                <p className="mt-2"><strong>Common Issue:</strong> User exists but isn't confirmed - use "Confirm User" to fix this!</p>
              </div>

              {debugInfo && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Last Operation Debug Info:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;