import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, AlertTriangle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

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
          <div className="text-center mb-12">
            <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Please read these terms carefully before using FTG designmatch.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: January 1, 2024
            </p>
          </div>

          <div className="space-y-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Agreement to Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By accessing and using FTG designmatch, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do 
                  not use this service.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Platform Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">For Clients</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Post design projects and requirements</li>
                    <li>Browse and hire qualified designers</li>
                    <li>Communicate through our secure messaging system</li>
                    <li>Make payments through our secure escrow system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">For Designers</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Create professional profiles and portfolios</li>
                    <li>Apply to relevant design projects</li>
                    <li>Deliver work and receive payments</li>
                    <li>Build long-term client relationships</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">All Users Must:</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Provide accurate and truthful information</li>
                      <li>Maintain the security of their account credentials</li>
                      <li>Respect intellectual property rights</li>
                      <li>Communicate professionally and respectfully</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Prohibited Activities:</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Posting false, misleading, or fraudulent content</li>
                      <li>Attempting to circumvent our payment system</li>
                      <li>Harassing or discriminating against other users</li>
                      <li>Uploading malicious software or spam</li>
                      <li>Violating copyright or trademark laws</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Commission Structure</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>FTG designmatch charges a 10% commission on completed projects</li>
                    <li>Designers keep 90% of the project value</li>
                    <li>Commission is automatically deducted from payments</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Processing</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>All payments are processed securely through Stripe</li>
                    <li>Funds are held in escrow until project completion</li>
                    <li>Refunds are handled according to our refund policy</li>
                    <li>Payment disputes are resolved through our mediation process</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    <strong>Work Product:</strong> Unless otherwise agreed in writing, all design work 
                    created through our platform becomes the property of the client upon full payment.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Portfolio Rights:</strong> Designers retain the right to display completed 
                    work in their portfolios unless specifically restricted by client agreement.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Platform Content:</strong> FTG designmatch retains ownership of all platform 
                    features, design, and functionality.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  FTG designmatch acts as a platform connecting clients and designers. We are not 
                  responsible for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>The quality or timeliness of work delivered</li>
                  <li>Disputes between clients and designers</li>
                  <li>Loss of data or business interruption</li>
                  <li>Actions or omissions of platform users</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to terminate or suspend accounts that violate these terms. 
                  Users may also terminate their accounts at any time.
                </p>
                <p className="text-muted-foreground">
                  Upon termination, users remain responsible for any outstanding obligations and 
                  the terms regarding intellectual property continue to apply.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@ftgdesignmatch.com</p>
                  <p><strong>Address:</strong> FTG designmatch, Legal Department</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;