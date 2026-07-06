'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Verified, Users } from 'lucide-react';

const suggestedUsers = [
  { id: '1', name: 'Sarah Johnson', username: 'sarahj', avatar: '', isVerified: true },
  { id: '2', name: 'Alex Chen', username: 'alexc', avatar: '', isVerified: false },
  { id: '3', name: 'Maria Garcia', username: 'mariag', avatar: '', isVerified: true },
];

const whoToFollow = [
  { id: '4', name: 'Tech Daily', username: 'techdaily', avatar: '', followers: '2.1M' },
  { id: '5', name: 'Design Hub', username: 'designhub', avatar: '', followers: '890K' },
];

export function RightSidebar() {
  return (
    <aside className="hidden xl:block w-80 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* Suggested Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Who to follow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {whoToFollow.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{user.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
                <Button size="sm" variant="outline">Follow</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trending for you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { topic: '#WebDevelopment', category: 'Technology', posts: '45.2K' },
              { topic: '#UIUX', category: 'Design', posts: '23.1K' },
              { topic: '#MachineLearning', category: 'AI', posts: '67.8K' },
              { topic: '#StartupLife', category: 'Business', posts: '12.4K' },
            ].map((item) => (
              <Link key={item.topic} href={`/search?q=${encodeURIComponent(item.topic)}`}>
                <div className="hover:bg-muted rounded-lg p-2 -mx-2 transition-colors">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    <span className="text-xs text-muted-foreground">{item.posts} posts</span>
                  </div>
                  <p className="font-medium text-sm mt-1">{item.topic}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-xs text-muted-foreground space-x-2">
          <Link href="/about" className="hover:underline">About</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link href="/help" className="hover:underline">Help</Link>
          <p className="mt-2">© 2026 Social Platform</p>
        </div>
      </div>
    </aside>
  );
}
