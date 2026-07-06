'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import { Home, Search, Bell, Mail, Bookmark, User, Settings, Hash, TrendingUp } from 'lucide-react';

const sidebarItems = [
  { href: '/feed', icon: Home, label: 'Home' },
  { href: '/explore', icon: Hash, label: 'Explore' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/messages', icon: Mail, label: 'Messages' },
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const trendingTopics = [
  { name: '#Technology', posts: '125K' },
  { name: '#Design', posts: '89K' },
  { name: '#Programming', posts: '234K' },
  { name: '#AI', posts: '456K' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* User Card */}
        <div className="rounded-xl border bg-card p-4">
          <Link href={`/profile/${user?.username}`} className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar || ''} alt={user?.displayName} />
              <AvatarFallback className="text-lg">{user?.displayName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </Link>
          <div className="mt-3 flex gap-4 text-sm">
            <div>
              <span className="font-semibold">{user?.followingCount || 0}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold">{user?.followersCount || 0}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Trending */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Trending</h3>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic) => (
              <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.name)}`}>
                <div className="hover:bg-muted rounded-lg p-2 -mx-2 transition-colors">
                  <p className="font-medium text-sm">{topic.name}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
