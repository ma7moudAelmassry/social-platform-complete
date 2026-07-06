'use client';

import { useState, useRef, useCallback } from 'react';
import { useFeedStore } from '@/stores/feedStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { Image, X, Loader2, Smile } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export function PostComposer() {
  const { user } = useAuthStore();
  const { addPost } = useFeedStore();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, 4);
    setFiles(newFiles);

    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 4));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    maxFiles: 4,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      files.forEach((file) => formData.append('media', file));

      const response = await api.createPost(formData);
      addPost(response.data);

      // Reset
      setContent('');
      previews.forEach(URL.revokeObjectURL);
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user?.avatar || ''} alt={user?.displayName} />
          <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            className="min-h-[80px] border-none resize-none focus-visible:ring-0 p-0 text-base"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Media Previews */}
          {previews.length > 0 && (
            <div className={`grid gap-2 mt-3 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {previews.map((preview, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden group">
                  <img src={preview} alt="" className="w-full h-40 object-cover" />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drop Zone */}
          {files.length < 4 && (
            <div
              {...getRootProps()}
              className={`mt-3 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'
              }`}
            >
              <input {...getInputProps()} />
              <Image className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">
                {isDragActive ? 'Drop files here' : 'Drag & drop or click to add media'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                <Image className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${content.length > 280 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {content.length}/280
              </span>
              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && files.length === 0) || isSubmitting || content.length > 280}
                size="sm"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
