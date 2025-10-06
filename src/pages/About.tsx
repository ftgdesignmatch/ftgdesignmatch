import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Users, Lightbulb, Shield, Star, Target, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

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
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About <span className="text-primary">FTG</span>designmatch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Where great design meets great collaboration
            </p>
          </div>

          {/* Founder Story */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm mb-12">
            <CardContent className="pt-8">
              <div className="grid md:grid-cols-2 gap-8 items-start md:items-center">
                <div className="order-2 md:order-1 space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Our Story</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
                    <p>
                      At FTGDesignMatch, we believe great design deserves great collaboration.
                    </p>
                    <p>
                      Founded by a passionate graphic designer with over half a decade of experience, 
                      FTGDesignMatch was born out of a real challenge—finding clients as a creative was 
                      harder than it should be. That struggle sparked a vision: to build a platform where 
                      designers and clients could connect seamlessly, transparently, and with mutual respect.
                    </p>
                    <p>
                      We're more than just a marketplace. We're a community-driven hub where creativity 
                      meets opportunity. Our goal is to eliminate the guesswork and gatekeeping that often 
                      plague freelance design work. Whether you're a designer looking to showcase your talent 
                      or a client seeking the perfect creative partner, FTGDesignMatch is your bridge to 
                      meaningful collaboration.
                    </p>
                    <p className="font-semibold text-primary">
                      Join us in reshaping the design industry—one match at a time.
                    </p>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="relative max-w-sm mx-auto">
                    <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 mx-auto">
                      {/* Fortune Iretiosa Uwoghiren Founder Image */}
                      <img 
                        src="./images/fortune-founder.jpg" 
                        alt="Fortune Iretiosa Uwoghiren - Founder" 
                        className="w-full h-full object-cover rounded-2xl border-4 border-primary/20 shadow-lg"
                      />
                    </div>
                    <div className="text-center mt-4 px-2">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">FORTUNE IRETIOSA UWOGHIREN</h3>
                      <p className="text-primary font-semibold text-sm sm:text-base">Founder & CEO</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Stand For */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-4">What We Stand For</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our core values guide everything we do at FTGDesignMatch
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">Transparency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Clear communication, fair pricing, and honest feedback in every interaction.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <CardHeader>
                  <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">Empowerment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Giving designers the visibility they deserve and clients the confidence to choose the right fit.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <CardHeader>
                  <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">Quality Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We don't just match people—we build relationships that lead to stunning results.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mission Statement */}
          <Card className="border-border/50 bg-primary/5 backdrop-blur-sm text-center">
            <CardContent className="pt-12 pb-12">
              <Users className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                To create a world where every designer has access to meaningful work and every client 
                can find the perfect creative partner. We're building more than a platform—we're 
                fostering a community where creativity thrives and collaboration flourishes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/join-as-designer')}>
                  <Heart className="mr-2 h-4 w-4" />
                  Join as Designer
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/find-designers')}>
                  <Users className="mr-2 h-4 w-4" />
                  Find Designers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">5+</div>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">90%</div>
              <p className="text-muted-foreground">Designer Earnings</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10%</div>
              <p className="text-muted-foreground">Platform Fee</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Secure Payments</p>
            </div>
          </div>

          {/* Contact Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm mt-16">
            <CardContent className="pt-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                  Ready to start your design journey? We'd love to hear from you.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </div>
                    <a 
                      href="mailto:fortunegrt24@gmail.com" 
                      className="text-muted-foreground hover:text-primary transition-colors font-medium text-sm sm:text-base break-all"
                    >
                      fortunegrt24@gmail.com
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                    <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                      </svg>
                    </div>
                    <a 
                      href="https://wa.me/2347043075890" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-green-500 transition-colors font-medium text-sm sm:text-base"
                    >
                      WhatsApp: +234 704 307 5890
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;