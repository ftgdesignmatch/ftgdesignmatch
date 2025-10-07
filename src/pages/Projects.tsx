import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, FileText, Download, Eye, MessageSquare, Star, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Projects = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    fileName: '',
    fileUrl: '',
    isFinal: false
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    approved: true,
    revisionNotes: ''
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await fetchUserProfile(session.user.id);
      await fetchProjects(session.user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_2025_09_30_12_43')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchProjects = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('projects_2025_10_04_12_00')
        .select(`
          *,
          client:client_id(email),
          designer:designer_id(email)
        `)
        .or(`client_id.eq.${userId},designer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchDeliverables = async (projectId) => {
    try {
      const { data, error } = await supabase
        .from('project_deliverables_2025_10_04_12_00')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDeliverables(data || []);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      setDeliverables([]);
    }
  };

  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    await fetchDeliverables(project.id);
  };

  const handleUploadDeliverable = async () => {
    if (!uploadForm.title || !uploadForm.fileName || !uploadForm.fileUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('submit_deliverable_for_approval', {
        body: {
          project_uuid: selectedProject.id,
          deliverable_title: uploadForm.title,
          file_name: uploadForm.fileName,
          file_url: uploadForm.fileUrl,
          deliverable_description: uploadForm.description,
          file_type: uploadForm.fileName.split('.').pop(),
          is_final: uploadForm.isFinal
        }
      });

      if (error) throw error;

      toast({
        title: "Deliverable Uploaded",
        description: "Your deliverable has been submitted for client approval",
      });

      setUploadDialogOpen(false);
      setUploadForm({ title: '', description: '', fileName: '', fileUrl: '', isFinal: false });
      await fetchDeliverables(selectedProject.id);
      await fetchProjects(user.id);
    } catch (error) {
      console.error('Error uploading deliverable:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload deliverable",
        variant: "destructive",
      });
    }
  };

  const handleReviewDeliverable = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('review_deliverable', {
        body: {
          deliverable_uuid: selectedDeliverable.id,
          approved: reviewForm.approved,
          revision_notes: reviewForm.revisionNotes
        }
      });

      if (error) throw error;

      const message = data.project_completed 
        ? "Project completed! All watermarks have been removed."
        : reviewForm.approved 
          ? "Deliverable approved successfully"
          : "Revision requested";

      toast({
        title: reviewForm.approved ? "Approved" : "Revision Requested",
        description: message,
      });

      setReviewDialogOpen(false);
      setReviewForm({ approved: true, revisionNotes: '' });
      await fetchDeliverables(selectedProject.id);
      await fetchProjects(user.id);
    } catch (error) {
      console.error('Error reviewing deliverable:', error);
      toast({
        title: "Review Failed",
        description: error.message || "Failed to review deliverable",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'open': { color: 'bg-blue-500', text: 'Open' },
      'in_progress': { color: 'bg-yellow-500', text: 'In Progress' },
      'pending_approval': { color: 'bg-orange-500', text: 'Pending Approval' },
      'revision_requested': { color: 'bg-red-500', text: 'Revision Requested' },
      'completed': { color: 'bg-green-500', text: 'Completed' },
      'cancelled': { color: 'bg-gray-500', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['open'];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  const isDesigner = userProfile?.user_type === 'designer';
  const isClient = userProfile?.user_type === 'client';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
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
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Project Management</h1>
            <p className="text-muted-foreground">
              {isDesigner ? "Manage your design projects and deliverables" : "Track your projects and review deliverables"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>
                    {projects.length} active project{projects.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No projects yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => navigate('/find-designers')}
                      >
                        {isClient ? "Start a Project" : "Find Projects"}
                      </Button>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <Card 
                        key={project.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm">{project.title}</h3>
                            {getStatusBadge(project.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {project.description?.substring(0, 100)}...
                          </p>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>${project.budget}</span>
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedProject.title}
                          {getStatusBadge(selectedProject.status)}
                        </CardTitle>
                        <CardDescription>{selectedProject.description}</CardDescription>
                      </div>
                      {isDesigner && selectedProject.status !== 'completed' && (
                        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Deliverable
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Upload Deliverable</DialogTitle>
                              <DialogDescription>
                                Submit your work for client approval
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                  id="title"
                                  value={uploadForm.title}
                                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                                  placeholder="e.g., Logo Design - First Draft"
                                />
                              </div>
                              <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                  id="description"
                                  value={uploadForm.description}
                                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                                  placeholder="Describe your deliverable..."
                                />
                              </div>
                              <div>
                                <Label htmlFor="fileName">File Name *</Label>
                                <Input
                                  id="fileName"
                                  value={uploadForm.fileName}
                                  onChange={(e) => setUploadForm({...uploadForm, fileName: e.target.value})}
                                  placeholder="logo-design-v1.png"
                                />
                              </div>
                              <div>
                                <Label htmlFor="fileUrl">File URL *</Label>
                                <Input
                                  id="fileUrl"
                                  value={uploadForm.fileUrl}
                                  onChange={(e) => setUploadForm({...uploadForm, fileUrl: e.target.value})}
                                  placeholder="https://example.com/file.png"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="isFinal"
                                  checked={uploadForm.isFinal}
                                  onChange={(e) => setUploadForm({...uploadForm, isFinal: e.target.checked})}
                                />
                                <Label htmlFor="isFinal">This is a final deliverable</Label>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUploadDeliverable}>
                                  Upload
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="deliverables">
                      <TabsList>
                        <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                        <TabsTrigger value="details">Project Details</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="deliverables" className="space-y-4">
                        {deliverables.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No deliverables uploaded yet</p>
                            {isDesigner && (
                              <p className="text-sm">Upload your first deliverable to get started</p>
                            )}
                          </div>
                        ) : (
                          deliverables.map((deliverable) => (
                            <Card key={deliverable.id} className="border-border/50">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold">{deliverable.title}</h4>
                                      {deliverable.is_final_deliverable && (
                                        <Badge variant="outline">Final</Badge>
                                      )}
                                      {deliverable.is_watermarked ? (
                                        <Badge variant="secondary">Watermarked</Badge>
                                      ) : (
                                        <Badge className="bg-green-500 text-white">No Watermark</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {deliverable.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>{deliverable.file_name}</span>
                                      <span>Uploaded: {new Date(deliverable.uploaded_at).toLocaleDateString()}</span>
                                      {deliverable.approved_at && (
                                        <span>Approved: {new Date(deliverable.approved_at).toLocaleDateString()}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {deliverable.client_approved ? (
                                      <Badge className="bg-green-500 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Approved
                                      </Badge>
                                    ) : selectedProject.status === 'revision_requested' ? (
                                      <Badge className="bg-red-500 text-white">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Revision Needed
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-orange-500 text-white">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending Review
                                      </Badge>
                                    )}
                                    
                                    {isClient && !deliverable.client_approved && (
                                      <Dialog 
                                        open={reviewDialogOpen && selectedDeliverable?.id === deliverable.id} 
                                        onOpenChange={(open) => {
                                          setReviewDialogOpen(open);
                                          if (open) setSelectedDeliverable(deliverable);
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Button size="sm" variant="outline">
                                            Review
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Review Deliverable</DialogTitle>
                                            <DialogDescription>
                                              {deliverable.title}
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="flex items-center space-x-4">
                                              <Button
                                                variant={reviewForm.approved ? "default" : "outline"}
                                                onClick={() => setReviewForm({...reviewForm, approved: true})}
                                              >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve
                                              </Button>
                                              <Button
                                                variant={!reviewForm.approved ? "destructive" : "outline"}
                                                onClick={() => setReviewForm({...reviewForm, approved: false})}
                                              >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Request Revision
                                              </Button>
                                            </div>
                                            
                                            {!reviewForm.approved && (
                                              <div>
                                                <Label htmlFor="revisionNotes">Revision Notes</Label>
                                                <Textarea
                                                  id="revisionNotes"
                                                  value={reviewForm.revisionNotes}
                                                  onChange={(e) => setReviewForm({...reviewForm, revisionNotes: e.target.value})}
                                                  placeholder="Please explain what changes are needed..."
                                                />
                                              </div>
                                            )}
                                            
                                            <div className="flex justify-end space-x-2">
                                              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                                                Cancel
                                              </Button>
                                              <Button onClick={handleReviewDeliverable}>
                                                Submit Review
                                              </Button>
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )}
                                  </div>
                                </div>
                                
                                {deliverable.revision_notes && (
                                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-red-800">Revision Notes:</p>
                                        <p className="text-sm text-red-700">{deliverable.revision_notes}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                      
                      <TabsContent value="details" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Budget</Label>
                            <p className="text-lg font-semibold">${selectedProject.budget}</p>
                          </div>
                          <div>
                            <Label>Deadline</Label>
                            <p>{selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : 'Not set'}</p>
                          </div>
                          <div>
                            <Label>Client</Label>
                            <p>{selectedProject.client?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <Label>Designer</Label>
                            <p>{selectedProject.designer?.email || 'Not assigned'}</p>
                          </div>
                          <div>
                            <Label>Created</Label>
                            <p>{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                          </div>
                          {selectedProject.completed_at && (
                            <div>
                              <Label>Completed</Label>
                              <p>{new Date(selectedProject.completed_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        
                        {selectedProject.skills_required && selectedProject.skills_required.length > 0 && (
                          <div>
                            <Label>Required Skills</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedProject.skills_required.map((skill, index) => (
                                <Badge key={index} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a project to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;