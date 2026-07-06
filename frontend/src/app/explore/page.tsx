'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Post } from '@/types';
import { PostCard } from '@/components/post/PostCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, TrendingUp, Hash } from 'lucide-react';

const trendingTopics = [
  { name: '#WebDevelopment', category: 'Technology', posts: '125K' },
  { name: '#MachineLearning', category: 'AI', posts: '89K' },
  { name: '#UIUXDesign', category: 'Design', posts: '234K' },
  { name: '#StartupLife', category: 'Business', posts: '45K' },
  { name: '#OpenSource', category: 'Technology', posts: '67K' },
  { name: '#DevOps', category: 'Technology', posts: '33K' },
  { name: '#Blockchain', category: 'Crypto', posts: '78K' },
  { name: '#CloudComputing', category: 'Technology', posts: '56K' },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('trending');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await api.search(searchQuery, 'posts');
      setSearchResults(response.data.posts || []);
      setActiveTab('results');
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, people, or hashtags..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="results" disabled={searchResults.length === 0}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingTopics.slice(0, 5).map((topic, index) => (
                <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}>
                  <div className="flex items-center justify-between py-3 hover:bg-muted rounded-lg px-3 -mx-3 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{topic.name}</p>
                        <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {topic.category}
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {trendingTopics.map((topic) => (
              <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">{topic.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                    <p className="text-xs text-muted-foreground mt-1">{topic.category}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-4 space-y-4">
          {isSearching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : searchResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No results found</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Try searching for something else
                </p>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
