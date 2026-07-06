'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useNotificationStore } from '@/stores/notificationStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/utils';
import { Heart, MessageCircle, UserPlus, AtSign, Share2, Bell } from 'lucide-react';

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  share: Share2,
  message: MessageCircle,
};

const notificationColors = {
  like: 'text-red-500 bg-red-50',
  comment: 'text-blue-500 bg-blue-50',
  follow: 'text-green-500 bg-green-50',
  mention: 'text-purple-500 bg-purple-50',
  share: 'text-orange-500 bg-orange-50',
  message: 'text-cyan-500 bg-cyan-50',
};

export default function NotificationsPage() {
  const { notifications, isLoading, hasMore, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
          Mark all read
        </Button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-2">
          {notifications.length === 0 && isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No notifications yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  When someone interacts with you, you'll see it here
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || 'text-gray-500 bg-gray-50';

              return (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className={`p-2 rounded-full shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <Link href={`/profile/${notification.actor.username}`}>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.actor.avatar || ''} />
                            <AvatarFallback>{notification.actor.displayName[0]}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <p className="text-sm">
                            <Link href={`/profile/${notification.actor.username}`} className="font-semibold hover:underline">
                              {notification.actor.displayName}
                            </Link>{' '}
                            {notification.type === 'like' && 'liked your post'}
                            {notification.type === 'comment' && 'commented on your post'}
                            {notification.type === 'follow' && 'started following you'}
                            {notification.type === 'mention' && 'mentioned you in a post'}
                            {notification.type === 'share' && 'shared your post'}
                            {notification.type === 'message' && 'sent you a message'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}

          {hasMore && (
            <div className="flex justify-center py-4">
              <Button variant="outline" onClick={() => fetchNotifications()} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
