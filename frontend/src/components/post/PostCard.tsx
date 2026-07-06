'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { useFeedStore } from '@/stores/feedStore';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatNumber, truncateText } from '@/lib/utils';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Verified, Trash2, Flag } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const { updatePost, removePost } = useFeedStore();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.unlikePost(post.id);
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
        updatePost(post.id, { isLiked: false, likesCount: likesCount - 1 });
      } else {
        await api.likePost(post.id);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        updatePost(post.id, { isLiked: true, likesCount: likesCount + 1 });
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.savePost(post.id);
      setIsSaved(!isSaved);
      updatePost(post.id, { isSaved: !isSaved });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      removePost(post.id);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
    }
  };

  const isAuthor = user?.id === post.author.id;

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar || ''} alt={post.author.displayName} />
              <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{post.author.displayName}</span>
                {post.author.isVerified && <Verified className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>@{post.author.username}</span>
                <span>·</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor ? (
                <DropdownMenuItem onClick={handleDelete} className="text-red-600" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <Link href={`/post/${post.id}`} className="block mt-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </Link>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={`mt-3 grid gap-2 rounded-xl overflow-hidden ${
            post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
          }`}>
            {post.media.map((media) => (
              <div key={media.id} className="relative">
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-64 object-cover rounded-xl"
                    poster={media.thumbnail}
                  />
                ) : (
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-64 object-cover rounded-xl"
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.hashtags.map((tag) => (
              <Link key={tag} href={`/search?q=%23${tag}`}>
                <span className="text-primary text-sm hover:underline">#{tag}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{formatNumber(likesCount)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{formatNumber(post.commentsCount)}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">{formatNumber(post.sharesCount)}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={isSaved ? 'text-yellow-500' : 'text-muted-foreground'}
            onClick={handleSave}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
