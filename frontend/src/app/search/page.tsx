'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Post } from '@/types';
import { PostCard } from '@/components/post/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Users, FileText, Hash } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await api.search(searchQuery);
      setUsers(response.data.users || []);
      setPosts(response.data.posts || []);
      setHashtags(response.data.hashtags || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(query);
    window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-1" />
            Users
          </TabsTrigger>
          <TabsTrigger value="posts">
            <FileText className="h-4 w-4 mr-1" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="hashtags">
            <Hash className="h-4 w-4 mr-1" />
            Hashtags
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-6">
          {isLoading ? (
            <SearchSkeleton />
          ) : (
            <>
              {users.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">People</h2>
                  <div className="space-y-2">
                    {users.slice(0, 3).map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}
              {posts.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Posts</h2>
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
              {hashtags.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Hashtags</h2>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <Link key={tag.id} href={`/search?q=%23${tag.name}`}>
                        <span className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors">
                          #{tag.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {users.length === 0 && posts.length === 0 && hashtags.length === 0 && query && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No results found</h3>
                    <p className="text-muted-foreground text-sm mt-1">Try different keywords</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-2">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="posts" className="mt-4 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="hashtags" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <Link key={tag.id} href={`/search?q=%23${tag.name}`}>
                <span className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors">
                  #{tag.name}
                </span>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserCard({ user }: { user: User }) {
  return (
    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
      <CardContent className="p-4 flex items-center justify-between">
        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar || ''} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.displayName}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>}
          </div>
        </Link>
        <Button variant="outline" size="sm">Follow</Button>
      </CardContent>
    </Card>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
