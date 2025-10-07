import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const EmailTest = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [result, setResult] = useState(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const testEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      console.log('Testing email with:', { email, fullName });
      
      const { data, error } = await supabase.functions.invoke('test_email_2025_09_30_12_43', {
        body: {
          email: email,
          fullName: fullName
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        throw error;
      }

      setResult(data);
      toast({
        title: "Test Email Sent!",
        description: `Check ${email} for the test email. Message ID: ${data?.message_id}`,
      });
    } catch (error: any) {
      console.error('Email test error:', error);
      toast({
        title: "Email Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url('./images/design_bg_1.jpeg')`,
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
        <div className="container mx-auto max-w-md">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary flex items-center justify-center">
                <TestTube className="h-6 w-6 mr-2" />
                Email Test
              </CardTitle>
              <CardDescription>
                Test the branded email system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={testEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-name">Full Name</Label>
                  <Input
                    id="test-name"
                    type="text"
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending Test Email..." : "Send Test Email"}
                </Button>
              </form>

              {result && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Test Result:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
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

export default EmailTest;