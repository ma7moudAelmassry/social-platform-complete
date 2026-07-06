'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User, Post as PostType } from '@/types';
import { PostCard } from '@/components/post/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { MapPin, Link as LinkIcon, Calendar, Verified, MessageCircle, UserPlus, UserCheck, Settings } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await api.getUser(username as string);
        setProfile(response.data);
        setIsFollowing(response.data.isFollowing || false);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (isFollowing) {
        await api.unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile((prev) => prev ? { ...prev, followersCount: prev.followersCount - 1 } : null);
      } else {
        await api.followUser(profile.id);
        setIsFollowing(true);
        setProfile((prev) => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const isOwnProfile = currentUser?.id === profile?.id;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="flex gap-4 px-4">
          <Skeleton className="h-24 w-24 rounded-full -mt-12 border-4 border-background" />
          <div className="flex-1 space-y-2 pt-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl" />

      {/* Profile Header */}
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex gap-4">
            <Avatar className="h-24 w-24 -mt-12 border-4 border-background rounded-full">
              <AvatarImage src={profile.avatar || ''} alt={profile.displayName} />
              <AvatarFallback className="text-2xl">{profile.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.displayName}</h1>
                {profile.isVerified && <Verified className="h-5 w-5 text-blue-500" />}
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwnProfile ? (
              <Link href="/settings">
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <>
                <Link href={`/messages?user=${profile.id}`}>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? 'outline' : 'default'}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm">{profile.bio}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          {profile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <span className="font-bold">{formatNumber(profile.postsCount)}</span>
            <span className="text-muted-foreground ml-1">Posts</span>
          </div>
          <Link href={`/profile/${profile.username}/followers`}>
            <span className="font-bold">{formatNumber(profile.followersCount)}</span>
            <span className="text-muted-foreground ml-1">Followers</span>
          </Link>
          <Link href={`/profile/${profile.username}/following`}>
            <span className="font-bold">{formatNumber(profile.followingCount)}</span>
            <span className="text-muted-foreground ml-1">Following</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-12">
          <TabsTrigger value="posts" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Posts
          </TabsTrigger>
          <TabsTrigger value="replies" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Replies
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Media
          </TabsTrigger>
          <TabsTrigger value="likes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Likes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </TabsContent>

        <TabsContent value="replies" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No replies yet</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No media yet</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="likes" className="mt-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No liked posts yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
