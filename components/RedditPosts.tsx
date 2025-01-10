import { fetchRedditPosts } from "@/utils/fetchRedditPosts";
import { ExternalLink, Search, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
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
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import React, { useEffect, useState, useRef } from "react";


interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  author: string;
  score: number;
  selftext: string;
}

const RedditPosts: React.FC = () => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("CARS tips");
  const [sortOption, setSortOption] = useState<string>("month");
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({});

  const cacheRef = useRef<{ [key: string]: RedditPost[] }>({});
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  const fetchPosts = async () => {
    const cacheKey = `${debouncedSearchQuery}_${sortOption}`;

    if (cacheRef.current[cacheKey]) {
      setPosts(cacheRef.current[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await fetchRedditPosts(
        "MCAT",
        debouncedSearchQuery,
        sortOption
      );
      setPosts(fetchedPosts);

      // Store fetched data in cache
      cacheRef.current[cacheKey] = fetchedPosts;

      // Optional: Manage cache size
      const cacheKeys = Object.keys(cacheRef.current);
      const MAX_CACHE_SIZE = 50;
      if (cacheKeys.length > MAX_CACHE_SIZE) {
        delete cacheRef.current[cacheKeys[0]];
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery.trim() !== "") {
      fetchPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, sortOption]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

  const formatContent = (content: string) => {
    const htmlContent: string = marked(content) as string;
    const sanitizedContent = DOMPurify.sanitize(htmlContent);
    return sanitizedContent.replace(/<\/p><p>/g, '</p><br><p>');
  };  

  const openDialog = (post: RedditPost) => {
    setSelectedPost(post);
  };

  const closeDialog = () => {
    setSelectedPost(null);
  };

  const isContentTruncated = (element?: HTMLElement | null) => {
    return element ? element.scrollHeight > element.clientHeight : true
  };

  return (
    <div className="h-full flex flex-col">
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
      <div 
        className="flex-grow overflow-y-auto"
        style={{ 
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="p-4 bg-[--theme-reddit-color] rounded-lg shadow-md">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : posts.length > 0 ? (
          <div>
            {posts.map((post, index) => (
              <div key={index} className="p-4 bg-[--theme-reddit-color] rounded-lg shadow-md relative mb-4">
                {/* Post Header */}
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start">
                    <a
                      href={`https://reddit.com${post.permalink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base xl:text-lg font-semibold text-blue-500 hover:underline"
                    >
                      {post.title}
                    </a>
                    {/* Full Screen Button */}
                    <button 
                      className="text-[--theme-text-color] hover:text-blue-500 ml-2 transition-colors"
                      onClick={() => openDialog(post)}
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs xl:text-sm text-gray-600">
                    Posted by u/{post.author} | Upvotes: {post.score}
                  </p>
                </div>

                {/* Modified Post Body */}
                {post.selftext && (
                  <div className="mt-4">
                    <div
                      ref={(el: HTMLDivElement | null) => {
                        contentRefs.current[index] = el;
                      }}
                      className={`text-xs xl:text-sm text-[--theme-text-color] reddit-content relative ${
                        !expandedPosts[index] ? 'max-h-[10rem]' : ''
                      } overflow-hidden`}
                      dangerouslySetInnerHTML={{
                        __html: formatContent(post.selftext),
                      }}
                    />
                    {!expandedPosts[index] && contentRefs.current[index] && 
                      isContentTruncated(contentRefs.current[index]) && (
                      <>
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[--theme-reddit-color] to-transparent" />
                        <button 
                          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                          onClick={() => openDialog(post)}
                        >
                          Read More
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No posts found for &quot;{debouncedSearchQuery}&quot;. Try a different search term.
          </p>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="bg-[--theme-reddit-color] rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <DialogClose className="absolute top-4 right-4"/>
          {selectedPost && (
            <>
              <a
                href={`https://reddit.com${selectedPost.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-semibold mb-4 text-blue-500 hover:underline"
              >
                {selectedPost.title}
              </a>
              <div className="mt-4 max-h-[60vh] overflow-y-auto">
                <div
                  className="text-sm xl:text-base text-[--theme-text-color] reddit-content"
                  dangerouslySetInnerHTML={{
                    __html: formatContent(selectedPost.selftext),
                  }}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RedditPosts;