'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { ChatRoom, Message } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { Search, Send, Image, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { socketClient } from '@/lib/socket';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const {
    rooms,
    activeRoom,
    messages,
    typingUsers,
    fetchRooms,
    setActiveRoom,
    fetchMessages,
    sendMessage,
    receiveMessage,
    createRoom,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId) {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        setActiveRoom(room);
      }
    }
  }, [searchParams, rooms, setActiveRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom?.id]);

  useEffect(() => {
    const handleNewMessage = (message: Message & { roomId: string }) => {
      receiveMessage(message.roomId, message);
    };

    socketClient.onNewMessage(handleNewMessage);

    return () => {
      socketClient.off('chat:new_message');
    };
  }, [receiveMessage]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeRoom) return;

    sendMessage(activeRoom.id, messageInput.trim());
    setMessageInput('');
  };

  const handleTyping = () => {
    if (!activeRoom) return;
    socketClient.emitTyping(activeRoom.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const activeMessages = activeRoom ? messages[activeRoom.id] || [] : [];
  const activeTypingUsers = activeRoom ? typingUsers[activeRoom.id] || [] : [];

  return (
    <div className="h-[calc(100vh-5rem)] -mx-4 lg:-mx-0">
      <div className="flex h-full gap-0 lg:gap-4">
        {/* Chat List */}
        <Card className="w-full lg:w-80 shrink-0 flex flex-col hidden sm:flex">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {rooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No conversations yet
                </div>
              ) : (
                rooms.map((room) => {
                  const otherParticipant = room.participants.find((p) => p.id !== user?.id);
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoom(room)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                        activeRoom?.id === room.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={otherParticipant?.avatar || ''} />
                        <AvatarFallback>{otherParticipant?.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{otherParticipant?.displayName}</p>
                          {room.lastMessage && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDate(room.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {room.lastMessage?.content || 'Start a conversation'}
                        </p>
                      </div>
                      {room.unreadCount > 0 && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                          {room.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        {activeRoom ? (
          <Card className="flex-1 flex flex-col">
            {/* Chat Header */}
            <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeRoom.participants.find((p) => p.id !== user?.id)?.avatar || ''} />
                  <AvatarFallback>
                    {activeRoom.participants.find((p) => p.id !== user?.id)?.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {activeRoom.participants.find((p) => p.id !== user?.id)?.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeTypingUsers.length > 0 ? 'typing...' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeMessages.map((message, index) => {
                  const isOwn = message.senderId === user?.id;
                  const showAvatar = index === 0 || activeMessages[index - 1].senderId !== message.senderId;

                  return (
                    <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && showAvatar ? (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={message.sender?.avatar || ''} />
                          <AvatarFallback>{message.sender?.displayName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                      ) : !isOwn ? (
                        <div className="w-8 shrink-0" />
                      ) : null}

                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          {message.content}
                          {message.media && (
                            <img
                              src={message.media.url}
                              alt=""
                              className="mt-2 rounded-lg max-w-full"
                            />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 px-1">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <CardContent className="pt-0 pb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Image className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Smile className="h-5 w-5 text-muted-foreground" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Select a conversation</h3>
              <p className="text-muted-foreground text-sm mt-1">Choose a chat from the sidebar to start messaging</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
