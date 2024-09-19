// components/RedditPosts.tsx
import React, { useEffect, useState } from "react";
import { fetchRedditPosts } from "@/utils/fetchRedditPosts";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Maximize2, // Import the full-screen icon
  X, // Add this import
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import useDebounce from "@/hooks/useDebounce";
import { FaReddit } from 'react-icons/fa';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

// Import the Dialog components
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  author: string;
  score: number;
  selftext: string;
}

const RedditPosts: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<RedditPost | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("CARS tips");
  const [sortOption, setSortOption] = useState<string>("month");
  const [expandedPost, setExpandedPost] = useState<boolean>(false);
  const [postIndex, setPostIndex] = useState<number>(0);

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false); // Add state for dialog

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await fetchRedditPosts(
        "MCAT",
        debouncedSearchQuery,
        sortOption
      );
      if (fetchedPosts.length > postIndex) {
        setCurrentPost(fetchedPosts[postIndex]);
      } else {
        setError("No more posts available.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [debouncedSearchQuery, sortOption, postIndex]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const formatContent = (content: string) => {
    const htmlContent: string = marked(content) as string; // Define type
    const sanitizedContent = DOMPurify.sanitize(htmlContent);
    return sanitizedContent.replace(/<\/p><p>/g, '</p><br><p>');
  };  

  const handleNextPost = () => {
    setPostIndex((prevIndex) => prevIndex + 1);
    setExpandedPost(false);
  };

  const toggleExpand = () => {
    setExpandedPost(!expandedPost);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <FaReddit className="text-3xl text-[#FF4500]" />
          <h2 className="text-lg font-semibold text-[--theme-text-color]">
            Insights from r/MCAT
          </h2>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center mb-4 space-x-2">
        <Input
          type="text"
          name="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search r/MCAT"
          className="flex-grow bg-[--theme-reddit-color] border-transparent text-[--theme-text-color] focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Select value={sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-20 bg-[--theme-reddit-color] border-transparent text-[--theme-text-color]">
            <span>
              {sortOption === "week" && "W"}
              {sortOption === "month" && "M"}
              {sortOption === "all" && "All"}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-[--theme-reddit-color] text-[--theme-text-color]">
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Post Content */}
      <ScrollArea className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-lg font-semibold text-[--theme-text-color]">
              Kalypso is fetching a post for you... 🐾
            </p>
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : currentPost ? (
          <div className="space-y-3">
            <div className="p-4 bg-[--theme-reddit-color] rounded-lg shadow-md relative">
              {/* Post Header */}
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <a
                    href={`https://reddit.com${currentPost.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base xl:text-lg font-semibold text-blue-500 hover:underline"
                  >
                    {currentPost.title}
                  </a>
                  {/* Full Screen Button */}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="text-[--theme-text-color] hover:text-blue-500 ml-2 transition-colors">
                        <Maximize2 size={14} />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                      <DialogClose className="absolute top-4 right-4">
                        <X className="h-6 w-6 text-gray-600 hover:text-gray-800" />
                      </DialogClose>
                      <a
                        href={`https://reddit.com${currentPost.permalink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold mb-4 text-blue-500 hover:underline"
                      >
                        {currentPost.title}
                      </a>
                      <div
                        className="prose max-w-none text-gray-800 mt-4"
                        dangerouslySetInnerHTML={{
                          __html: formatContent(currentPost.selftext),
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-xs xl:text-sm text-gray-600">
                  Posted by u/{currentPost.author} | Upvotes: {currentPost.score}
                </p>
              </div>

              {/* Post Body */}
              {currentPost.selftext && (
                <div className="mt-4">
                  <div
                    className={`text-xs xl:text-sm text-[--theme-text-color] reddit-content overflow-hidden ${
                      expandedPost ? '' : 'max-h-[5rem] xl:max-h-[20rem]'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: formatContent(currentPost.selftext),
                    }}
                  />
                  <div className="mt-3 flex justify-between items-center">
                    <button
                      onClick={toggleExpand}
                      className="text-xs xl:text-sm text-blue-500 flex items-center"
                    >
                      {expandedPost ? (
                        <>
                          Collapse <ChevronUp size={12} className="ml-1" />
                        </>
                      ) : (
                        <>
                          Expand <ChevronDown size={12} className="ml-1" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleNextPost}
                      className="text-xs xl:text-sm text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No posts found for &quot;{debouncedSearchQuery}&quot;. Try a different search term.
          </p>
        )}
      </ScrollArea>
    </div>
  );
};

export default RedditPosts;
