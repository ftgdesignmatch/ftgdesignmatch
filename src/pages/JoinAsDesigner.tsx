import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, Star, Users, DollarSign, Shield, Palette, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const JoinAsDesigner = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    portfolioUrl: "",
    bio: "",
    skills: [],
    hourlyRate: "",
    experience: "",
    specialization: "",
    availableForWork: true
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const skillOptions = [
    "Logo Design", "Brand Identity", "Web Design", "UI/UX Design", 
    "Print Design", "Packaging Design", "Illustration", "Typography",
    "Motion Graphics", "3D Design", "Social Media Design", "Marketing Materials"
  ];

  const experienceOptions = [
    "Less than 1 year", "1-2 years", "3-5 years", "5-10 years", "10+ years"
  ];

  const specializationOptions = [
    "Brand & Identity", "Web & Digital", "Print & Publishing", 
    "Packaging", "Illustration", "Motion Graphics", "UI/UX"
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.full_name || ""
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        // Sign up new user without email verification requirement
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              user_type: 'designer'
            }
          }
        });

        if (authError) throw authError;

        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (authData.user) {
          // Update the profile with designer-specific information
          const { error: profileError } = await supabase
            .from('user_profiles_2025_09_30_12_43')
            .update({
              user_type: 'designer',
              full_name: formData.fullName,
              portfolio_url: formData.portfolioUrl,
              bio: formData.bio,
              skills: formData.skills,
              hourly_rate: parseFloat(formData.hourlyRate) || null
            })
            .eq('user_id', authData.user.id);

          if (profileError) {
            console.error('Profile update error:', profileError);
            // If update fails, try insert
            const { error: insertError } = await supabase
              .from('user_profiles_2025_09_30_12_43')
              .insert({
                user_id: authData.user.id,
                user_type: 'designer',
                full_name: formData.fullName,
                email: formData.email,
                portfolio_url: formData.portfolioUrl,
                bio: formData.bio,
                skills: formData.skills,
                hourly_rate: parseFloat(formData.hourlyRate) || null
              });

            if (insertError) throw insertError;
          }

          // Send branded welcome email
          try {
            await supabase.functions.invoke('send_branded_email_2025_09_30_12_43', {
              body: {
                email: formData.email,
                fullName: formData.fullName,
                type: 'verification'
              }
            });
          } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the registration if email fails
          }
        }

        toast({
          title: "Welcome to FTG designmatch! 🎉",
          description: "Your designer account is ready! You can now sign in and start applying to projects.",
        });

        // Redirect to auth page to sign in
        navigate('/auth');
      } else {
        // Update existing user profile
        const { error } = await supabase
          .from('user_profiles_2025_09_30_12_43')
          .upsert({
            user_id: user.id,
            user_type: 'designer',
            full_name: formData.fullName,
            email: formData.email,
            portfolio_url: formData.portfolioUrl,
            bio: formData.bio,
            skills: formData.skills,
            hourly_rate: parseFloat(formData.hourlyRate) || null
          });

        if (error) throw error;

        toast({
          title: "Profile Updated!",
          description: "Your designer profile has been successfully updated.",
        });
      }

      // Don't redirect here - let the individual flows handle it
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Palette className="h-3 w-3 mr-1" />
              Join Our Creative Community
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Become a designmatch Designer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create your designer account and complete your professional profile. 
              Start earning money doing what you love with our secure platform.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Earn More</CardTitle>
                <CardDescription>
                  Keep 90% of your earnings with our low 10% commission
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Quality Clients</CardTitle>
                <CardDescription>
                  Work with verified clients on meaningful projects
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Secure Payments</CardTitle>
                <CardDescription>
                  Get paid safely with our escrow protection system
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Application Form */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-primary flex items-center">
                <Briefcase className="h-6 w-6 mr-2" />
                Designer Application
              </CardTitle>
              <CardDescription>
                Create your account and complete your designer profile in one step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Password (only for new users) */}
                {!user && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                      placeholder="Create a secure password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 6 characters required
                    </p>
                  </div>
                )}

                {/* Portfolio & Rate */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfolio URL *</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      required
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="10"
                      max="500"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      required
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Experience & Specialization */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Primary Specialization *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {specializationOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    required
                    placeholder="Tell us about your design background, experience, and what makes you unique..."
                    rows={4}
                  />
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <Label>Skills & Expertise *</Label>
                  <p className="text-sm text-muted-foreground">Select all that apply (minimum 3)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skillOptions.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label htmlFor={skill} className="text-sm font-normal">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availableForWork"
                    checked={formData.availableForWork}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, availableForWork: !!checked }))
                    }
                  />
                  <Label htmlFor="availableForWork">
                    I'm currently available for new projects
                  </Label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading || formData.skills.length < 3}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    {loading ? (
                      "Submitting Application..."
                    ) : (
                      <>
                        <Star className="mr-2 h-4 w-4" />
                        Submit Designer Application
                      </>
                    )}
                  </Button>
                  {formData.skills.length < 3 && (
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Please select at least 3 skills to continue
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Join Successful Designers</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Sarah Chen", earnings: "$15K+", projects: "50+" },
                { name: "Marcus Rodriguez", earnings: "$22K+", projects: "75+" },
                { name: "Emma Thompson", earnings: "$18K+", projects: "60+" }
              ].map((designer, index) => (
                <Card key={index} className="border-border/50 bg-card/30 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">{designer.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Earned {designer.earnings} • {designer.projects} projects
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinAsDesigner;