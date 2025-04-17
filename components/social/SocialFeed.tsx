"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/store/selectors";
import { Heart, Share2, MessageCircle, Repeat2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  replies: number;
  isLiked: boolean;
  isRetweeted: boolean;
  image?: string;
}

// Demo posts to populate the feed
const DEMO_POSTS: Post[] = [
  {
    id: "1",
    author: {
      name: "MCAT Study Group",
      handle: "@mcatstudy",
      avatar: "/avatars/study-group.jpg",
    },
    content: "Just scored 518 on my MCAT after 3 months of studying! Here's what worked for me: consistent daily practice, AAMC materials, and lots of practice tests. Don't give up! #MCAT #MedicalSchool",
    timestamp: new Date(2023, 9, 15, 12, 30),
    likes: 243,
    retweets: 56,
    replies: 24,
    isLiked: false,
    isRetweeted: false,
  },
  {
    id: "2",
    author: {
      name: "Pre-Med Journey",
      handle: "@futuredoctor",
      avatar: "/avatars/premed.jpg",
    },
    content: "CARS section has been challenging me. Any tips on improving critical analysis skills? Looking for strategies that work! #MCAT #CARShelp",
    timestamp: new Date(2023, 9, 16, 9, 45),
    likes: 89,
    retweets: 12,
    replies: 67,
    isLiked: true,
    isRetweeted: false,
  },
  {
    id: "3",
    author: {
      name: "Biochemistry Queen",
      handle: "@biochemqueen",
      avatar: "/avatars/biochem.jpg",
    },
    content: "Here's a quick amino acid mnemonic that helped me ace the biochem section! 'PVT TIM HALL' for the nonpolar amino acids. What mnemonics are you using?",
    timestamp: new Date(2023, 9, 14, 15, 20),
    likes: 312,
    retweets: 78,
    replies: 42,
    isLiked: false,
    isRetweeted: true,
    image: "/images/amino-acids.jpg",
  },
  {
    id: "4",
    author: {
      name: "MCAT Motivation",
      handle: "@mcatmotivation",
      avatar: "/avatars/motivation.jpg",
    },
    content: "Remember: your MCAT score doesn't define you. Med schools look at the whole application. Stay balanced and take care of your mental health during prep! #PreMedAdvice",
    timestamp: new Date(2023, 9, 13, 18, 10),
    likes: 421,
    retweets: 135,
    replies: 28,
    isLiked: false,
    isRetweeted: false,
  },
  {
    id: "5",
    author: {
      name: "Physics Phenom",
      handle: "@mcatphysics",
      avatar: "/avatars/physics.jpg",
    },
    content: "Don't overlook physics! Just had 15 physics questions on my test yesterday. Focus on fluid dynamics and circuits especially. #MCATprep #Physics",
    timestamp: new Date(2023, 9, 12, 11, 5),
    likes: 178,
    retweets: 42,
    replies: 31,
    isLiked: false,
    isRetweeted: false,
  },
];

// Fallback handles for avatar generation - first letter of name
const getInitials = (name: string) => {
  return name.charAt(0).toUpperCase();
};

// Format timestamp to Twitter-like format
const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else {
    return format(date, 'MMM d');
  }
};

const SocialFeed: React.FC = () => {
  const { userInfo } = useUser();
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [activeTab, setActiveTab] = useState("for-you");

  // Handle post interactions (like, retweet)
  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            } 
          : post
      )
    );
  };

  const handleRetweet = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isRetweeted: !post.isRetweeted,
              retweets: post.isRetweeted ? post.retweets - 1 : post.retweets + 1 
            } 
          : post
      )
    );
  };

  // Create new post
  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: `${Date.now()}`,
      author: {
        name: userInfo?.firstName || "Anonymous User",
        handle: `@user${userInfo?.userId?.substring(0, 6) || "123"}`,
        avatar: "/avatars/default.jpg",
      },
      content: newPostContent,
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      replies: 0,
      isLiked: false,
      isRetweeted: false,
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  return (
    <div className="flex flex-col h-full bg-[--theme-mainbox-color] rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-[--theme-border-color]">
        <h1 className="text-xl font-bold text-[--theme-text-color]">Social Feed</h1>
        
        {/* Tabs */}
        <Tabs defaultValue="for-you" className="mt-4" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 bg-[--theme-leaguecard-color]">
            <TabsTrigger value="for-you">For You</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="for-you" className="mt-0 p-0">
            {/* Content is below */}
          </TabsContent>
          
          <TabsContent value="following" className="mt-0 p-0">
            {/* Same structure as For You, but would show different content */}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* New Post Input */}
      <div className="p-4 border-b border-[--theme-border-color] flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/avatars/default.jpg" alt={userInfo?.firstName || "User"} />
          <AvatarFallback>{getInitials(userInfo?.firstName || "User")}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex flex-col">
          <Input
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's happening?"
            className="bg-transparent border-0 border-b border-[--theme-border-color] rounded-none px-0 h-auto min-h-[4rem] text-[--theme-text-color] placeholder:text-[--theme-text-color]/50 focus:ring-0 resize-none"
          />
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2 text-[--theme-button-color]">
              <button className="p-2 rounded-full hover:bg-[--theme-button-color]/10 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H9.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 9H15.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-[--theme-button-color]/10 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                  <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <Button 
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
              className={cn(
                "rounded-full px-4 py-1 h-auto",
                !newPostContent.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
      
      {/* Posts Feed */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-[--theme-border-color]">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-[--theme-leaguecard-color]/50 transition-colors">
              <div className="flex gap-3">
                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-[--theme-text-color]">{post.author.name}</span>
                      <span className="text-[--theme-text-color]/60">{post.author.handle}</span>
                      <span className="text-[--theme-text-color]/60">· {formatTimestamp(post.timestamp)}</span>
                    </div>
                    <button className="text-[--theme-text-color]/60 hover:text-[--theme-button-color]">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Post Content */}
                  <p className="mt-1 text-[--theme-text-color]">{post.content}</p>
                  
                  {/* Post Image (if any) */}
                  {post.image && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-[--theme-border-color]">
                      <Image 
                        src={post.image} 
                        alt="Post image" 
                        width={500} 
                        height={300} 
                        className="w-full object-cover max-h-[300px]"
                      />
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="flex justify-between mt-3">
                    <button 
                      className="flex items-center gap-1 text-[--theme-text-color]/60 hover:text-[--theme-button-color]"
                    >
                      <div className="p-2 rounded-full hover:bg-[--theme-button-color]/10">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{post.replies}</span>
                    </button>
                    
                    <button 
                      className={cn(
                        "flex items-center gap-1",
                        post.isRetweeted ? "text-green-500" : "text-[--theme-text-color]/60 hover:text-green-500"
                      )}
                      onClick={() => handleRetweet(post.id)}
                    >
                      <div className={cn(
                        "p-2 rounded-full",
                        post.isRetweeted ? "text-green-500" : "hover:bg-green-500/10"
                      )}>
                        <Repeat2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{post.retweets}</span>
                    </button>
                    
                    <button 
                      className={cn(
                        "flex items-center gap-1",
                        post.isLiked ? "text-red-500" : "text-[--theme-text-color]/60 hover:text-red-500"
                      )}
                      onClick={() => handleLike(post.id)}
                    >
                      <div className={cn(
                        "p-2 rounded-full",
                        post.isLiked ? "text-red-500" : "hover:bg-red-500/10"
                      )}>
                        <Heart className={cn("w-4 h-4", post.isLiked && "fill-red-500")} />
                      </div>
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-[--theme-text-color]/60 hover:text-[--theme-button-color]">
                      <div className="p-2 rounded-full hover:bg-[--theme-button-color]/10">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SocialFeed; 