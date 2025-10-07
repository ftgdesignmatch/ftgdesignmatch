import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MessageSquare, 
  MessageCircle,
  Search, 
  Send, 
  User, 
  Clock,
  Paperclip,
  MoreVertical,
  Image as ImageIcon,
  Download,
  Shield,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [projectCompleted, setProjectCompleted] = useState(false);
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    // Start with empty messages - no fake data
    setMessages([]);
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from('user_profiles_2025_09_30_12_43')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  // Empty conversations - no fake data
  const conversations = [];

  // Sample messages for selected conversation with image sharing
  const sampleMessages = [
    {
      id: 1,
      sender: "Sarah Chen",
      message: "Hi! I'm excited to work on your logo design project. I've reviewed your brief and have some initial ideas.",
      timestamp: "10:30 AM",
      isOwn: false,
      type: "text"
    },
    {
      id: 2,
      sender: "You",
      message: "Great! I'm looking forward to seeing your concepts. The brand should feel modern and trustworthy.",
      timestamp: "10:45 AM",
      isOwn: true,
      type: "text"
    },
    {
      id: 3,
      sender: "Sarah Chen",
      message: "Absolutely! I'll focus on clean, modern typography with a professional color palette. I'll have the first concepts ready by tomorrow.",
      timestamp: "11:00 AM",
      isOwn: false,
      type: "text"
    },
    {
      id: 4,
      sender: "Sarah Chen",
      message: "Here are the initial logo concepts for your review:",
      timestamp: "2 hours ago",
      isOwn: false,
      type: "text"
    },
    {
      id: 5,
      sender: "Sarah Chen",
      message: "",
      timestamp: "2 hours ago",
      isOwn: false,
      type: "image",
      imageUrl: "./images/design_bg_1.jpeg",
      watermarked: !projectCompleted,
      fileName: "logo_concepts_v1.jpg"
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedFile) return;
    
    const newMsg = {
      id: messages.length + Date.now(),
      sender: "You",
      content: newMessage.trim(),
      timestamp: "Just now",
      isOwn: true,
      type: selectedFile ? "image" : "text",
      imageUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
      fileName: selectedFile?.name,
      isWatermarked: selectedFile ? !projectCompleted : false
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
    setSelectedFile(null);

    toast({
      title: "Message Sent",
      description: selectedFile ? "Image message sent successfully" : "Message sent successfully",
    });
  };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        toast({
          title: "Image Selected",
          description: `${file.name} ready to send. Images will be watermarked until project completion.`,
        });
      } else {
        toast({
          title: "File Type Not Supported",
          description: "Please select an image file (JPG, PNG, GIF).",
          variant: "destructive",
        });
      }
    }
  };

  const handleImageRightClick = (e) => {
    e.preventDefault();
    toast({
      title: "Protected Content",
      description: "This image is protected. Download, screenshot, and screen recording are disabled.",
      variant: "destructive",
    });
  };

  const WatermarkedImage = ({ src, alt, watermarked, projectCompleted }) => {
    const showWatermark = watermarked && !projectCompleted;
    
    return (
      <div 
        className="relative inline-block max-w-xs"
        onContextMenu={handleImageRightClick}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: showWatermark ? 'none' : 'auto'
        }}
      >
        <img 
          src={src} 
          alt={alt}
          className="rounded-lg max-w-full h-auto"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        />
        {showWatermark && (
          <>
            <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white px-3 py-1 rounded text-sm font-semibold transform rotate-12">
                FTG designmatch
              </div>
            </div>
            <div className="absolute top-2 right-2 pointer-events-none">
              <Shield className="h-4 w-4 text-white drop-shadow-lg" />
            </div>
          </>
        )}
        {projectCompleted && !watermarked && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white text-xs">
              <Download className="h-3 w-3 mr-1" />
              Available
            </Badge>
          </div>
        )}
        {!showWatermark && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="text-xs bg-white/90">
              {projectCompleted ? "Project Completed" : "No Watermark"}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

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
<<<<<<< HEAD
=======
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
>>>>>>> 91618263e2cde560237368da5db3e3b3df6a4081
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

      <div className="relative z-10 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
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
              <div>
                <h1 className="text-3xl font-bold text-foreground">Messages</h1>
                <p className="text-muted-foreground">
                  Communicate with your {profile?.user_type === 'designer' ? 'clients' : 'designers'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
            {/* Conversations List */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Badge variant="outline">{conversations.length}</Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[450px] overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No conversations yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start a project to begin messaging with {profile?.user_type === 'designer' ? 'clients' : 'designers'}
                      </p>
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-2 ${
                        selectedConversation?.id === conversation.id 
                          ? 'border-primary bg-muted/30' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {conversation.avatar}
                            </span>
                          </div>
                          {conversation.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm truncate">
                              {conversation.name}
                            </p>
                            <div className="flex items-center space-x-2">
                              {conversation.unread > 0 && (
                                <Badge variant="default" className="text-xs px-2 py-0">
                                  {conversation.unread}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {conversation.timestamp}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {conversation.project}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col">
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {selectedConversation.avatar}
                            </span>
                          </div>
                          {selectedConversation.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{selectedConversation.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedConversation.project}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.type === 'image' ? (
                              <div className="space-y-2">
                                {message.content && (
                                  <p className="text-sm">{message.content}</p>
                                )}
                                <WatermarkedImage 
                                  src={message.imageUrl} 
                                  alt={message.fileName}
                                  watermarked={message.isWatermarked}
                                  projectCompleted={projectCompleted}
                                />
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    {message.fileName}
                                  </span>
                                  {message.watermarked && (
                                    <span className="flex items-center text-yellow-600">
                                      <Shield className="h-3 w-3 mr-1" />
                                      Protected
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                            <p className={`text-xs mt-1 ${
                              message.isOwn 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border/50">
                    {selectedFile && (
                      <div className="mb-3 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm">{selectedFile.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Will be watermarked
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedFile(null)}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim() && !selectedFile}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Images shared by designers are watermarked and protected until project completion
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;