import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Star, MapPin, Clock, DollarSign, Filter, Users, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Designer {
  id: string;
  full_name: string;
  bio: string;
  skills: string[];
  hourly_rate: number;
  portfolio_url: string;
  avatar_url?: string;
}

const FindDesigners = () => {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [filteredDesigners, setFilteredDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [rateFilter, setRateFilter] = useState("");
  
  const navigate = useNavigate();

  const skillOptions = [
    "Logo Design", "Brand Identity", "Web Design", "UI/UX Design", 
    "Print Design", "Packaging Design", "Illustration", "Typography",
    "Motion Graphics", "3D Design", "Social Media Design", "Marketing Materials"
  ];

  const rateRanges = [
    { label: "Under $25/hr", value: "0-25" },
    { label: "$25-50/hr", value: "25-50" },
    { label: "$50-100/hr", value: "50-100" },
    { label: "$100+/hr", value: "100+" }
  ];

  useEffect(() => {
    fetchDesigners();
  }, []);

  useEffect(() => {
    filterDesigners();
  }, [designers, searchTerm, skillFilter, rateFilter]);

  const fetchDesigners = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_2025_09_30_12_43')
        .select('*')
        .eq('user_type', 'designer')
        .not('bio', 'is', null)
        .not('skills', 'is', null);

      if (error) throw error;
      
      setDesigners(data || []);
    } catch (error) {
      console.error('Error fetching designers:', error);
      // Show sample data for demo purposes
      setDesigners([
        {
          id: '1',
          full_name: 'Sarah Chen',
          bio: 'Creative brand designer with 5+ years of experience helping startups build memorable identities. Specialized in logo design and brand guidelines.',
          skills: ['Logo Design', 'Brand Identity', 'Typography', 'Print Design'],
          hourly_rate: 75,
          portfolio_url: 'https://sarahchen.design',
        },
        {
          id: '2',
          full_name: 'Marcus Rodriguez',
          bio: 'UI/UX designer passionate about creating intuitive digital experiences. Expert in web design and mobile app interfaces.',
          skills: ['UI/UX Design', 'Web Design', 'Mobile Design', 'Prototyping'],
          hourly_rate: 85,
          portfolio_url: 'https://marcusux.com',
        },
        {
          id: '3',
          full_name: 'Emma Thompson',
          bio: 'Illustration and packaging design specialist. I bring products to life with creative visual storytelling and eye-catching designs.',
          skills: ['Illustration', 'Packaging Design', 'Print Design', 'Brand Identity'],
          hourly_rate: 65,
          portfolio_url: 'https://emmaillustrates.com',
        },
        {
          id: '4',
          full_name: 'David Kim',
          bio: 'Motion graphics designer and animator. Creating engaging video content and animated graphics for digital marketing campaigns.',
          skills: ['Motion Graphics', '3D Design', 'Video Editing', 'Animation'],
          hourly_rate: 95,
          portfolio_url: 'https://davidmotion.studio',
        },
        {
          id: '5',
          full_name: 'Lisa Wang',
          bio: 'Social media design expert helping brands create consistent, engaging visual content across all platforms.',
          skills: ['Social Media Design', 'Marketing Materials', 'Brand Identity', 'Typography'],
          hourly_rate: 55,
          portfolio_url: 'https://lisasocial.design',
        },
        {
          id: '6',
          full_name: 'Alex Johnson',
          bio: 'Full-stack designer with expertise in both print and digital. From business cards to websites, I create cohesive brand experiences.',
          skills: ['Web Design', 'Print Design', 'Logo Design', 'UI/UX Design'],
          hourly_rate: 70,
          portfolio_url: 'https://alexdesigns.co',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterDesigners = () => {
    let filtered = [...designers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(designer =>
        designer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        designer.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        designer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Skill filter
    if (skillFilter) {
      filtered = filtered.filter(designer =>
        designer.skills.includes(skillFilter)
      );
    }

    // Rate filter
    if (rateFilter) {
      const [min, max] = rateFilter.split('-').map(Number);
      filtered = filtered.filter(designer => {
        if (rateFilter === "100+") {
          return designer.hourly_rate >= 100;
        }
        return designer.hourly_rate >= min && designer.hourly_rate <= max;
      });
    }

    setFilteredDesigners(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSkillFilter("");
    setRateFilter("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url('./images/design_bg_3.jpeg')`,
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
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Users className="h-3 w-3 mr-1" />
              Find Your Perfect Designer
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Browse Top Graphic Designers
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with talented designers who can bring your vision to life. 
              All designers are vetted and ready to start your project.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, skills, or expertise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillOptions.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={rateFilter} onValueChange={setRateFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Rate range" />
                  </SelectTrigger>
                  <SelectContent>
                    {rateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(searchTerm || skillFilter || rateFilter) && (
                  <Button variant="outline" onClick={clearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${filteredDesigners.length} designer${filteredDesigners.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Designers Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-muted rounded-full mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 w-16 bg-muted rounded"></div>
                        <div className="h-6 w-20 bg-muted rounded"></div>
                      </div>
                      <div className="h-10 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDesigners.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No designers found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all designers
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigners.map((designer) => (
                <Card key={designer.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="pt-6">
                    {/* Designer Avatar & Name */}
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <span className="text-primary font-bold text-lg">
                          {designer.full_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {designer.full_name}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${designer.hourly_rate}/hr
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {designer.bio}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {designer.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {designer.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{designer.skills.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => window.open(designer.portfolio_url, '_blank')}
                      >
                        <Briefcase className="h-3 w-3 mr-1" />
                        View Portfolio
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Star className="h-3 w-3 mr-1" />
                        Hire Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="border-border/50 bg-primary/5 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  Ready to Start Your Project?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Post your project details and get matched with the perfect designer for your needs. 
                  Our secure payment system ensures a smooth collaboration.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Post a Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDesigners;