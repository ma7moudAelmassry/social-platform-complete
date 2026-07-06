'use client';

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          Cookies.remove('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: { username: string; email: string; password: string; displayName: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    Cookies.remove('token');
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  // Users
  async getUser(username: string) {
    const response = await this.client.get(`/users/${username}`);
    return response.data;
  }

  async updateProfile(data: FormData) {
    const response = await this.client.patch('/users/me', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async followUser(userId: string) {
    const response = await this.client.post(`/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId: string) {
    const response = await this.client.delete(`/users/${userId}/follow`);
    return response.data;
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const response = await this.client.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const response = await this.client.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Posts
  async getFeed(page = 1, limit = 10) {
    const response = await this.client.get('/feed', {
      params: { page, limit },
    });
    return response.data;
  }

  async getPost(postId: string) {
    const response = await this.client.get(`/posts/${postId}`);
    return response.data;
  }

  async createPost(data: FormData) {
    const response = await this.client.post('/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deletePost(postId: string) {
    const response = await this.client.delete(`/posts/${postId}`);
    return response.data;
  }

  async likePost(postId: string) {
    const response = await this.client.post(`/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId: string) {
    const response = await this.client.delete(`/posts/${postId}/like`);
    return response.data;
  }

  async savePost(postId: string) {
    const response = await this.client.post(`/posts/${postId}/save`);
    return response.data;
  }

  async getComments(postId: string, page = 1, limit = 20) {
    const response = await this.client.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  }

  async createComment(postId: string, content: string) {
    const response = await this.client.post(`/posts/${postId}/comments`, { content });
    return response.data;
  }

  async deleteComment(postId: string, commentId: string) {
    const response = await this.client.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  }

  // Search
  async search(query: string, type?: 'users' | 'posts' | 'hashtags') {
    const response = await this.client.get('/search', {
      params: { q: query, type },
    });
    return response.data;
  }

  async getTrending() {
    const response = await this.client.get('/search/trending');
    return response.data;
  }

  // Notifications
  async getNotifications(page = 1, limit = 20) {
    const response = await this.client.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  }

  async markNotificationRead(notificationId: string) {
    const response = await this.client.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsRead() {
    const response = await this.client.patch('/notifications/read-all');
    return response.data;
  }

  // Chat
  async getChatRooms() {
    const response = await this.client.get('/chat/rooms');
    return response.data;
  }

  async getMessages(roomId: string, page = 1, limit = 50) {
    const response = await this.client.get(`/chat/rooms/${roomId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  }

  async createChatRoom(participantId: string) {
    const response = await this.client.post('/chat/rooms', { participantId });
    return response.data;
  }

  // Media
  async uploadMedia(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
