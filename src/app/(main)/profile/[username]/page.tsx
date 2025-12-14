'use client';

import { useEffect, useState } from 'react';
import ProfileHeader from "@/components/profile/ProfileHeader";
import { authService, userService } from "@/lib/api";
import type { User } from "@/lib/api";
import { notFound, useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams() as { username: string };
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, [params.username]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      if (params.username === 'me') {
        // Load current user
        const response = await authService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setError('Failed to load profile');
        }
      } else {
        // Search for user by name (API doesn't have username search yet, so we'll use listUsers with search)
        const response = await userService.listUsers({ 
          search: params.username, 
          pageSize: 100 
        });
        
        if (response.success && response.data && Array.isArray(response.data.data)) {
          // Find user by matching name (case-insensitive)
          const foundUser = response.data.data.find(
            u => u && u.name && u.name.toLowerCase().replace(/\s+/g, '') === params.username.toLowerCase()
          );
          
          if (foundUser) {
            setUser(foundUser);
          } else {
            setError('User not found');
          }
        } else {
          setError('Failed to load profile');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="md:hidden flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-8">
        <div className="md:hidden flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">{params.username}</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error || 'User not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Determine if this is the current user's profile
  const isCurrentUser = currentUser && user && currentUser.id === user.id;

  // Convert API User to ProfileHeader format (temporary adapter)
  const profileUser = {
    ...user,
    username: (user as any).username || (user.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'user'),
    avatar: {
      imageUrl: user.profileImage || '',
      imageHint: `${user.name || 'User'}'s profile picture`,
    },
    stats: {
      followers: typeof user.followersCount === 'number' ? user.followersCount : 0,
      following: typeof user.followingCount === 'number' ? user.followingCount : 0,
    },
    isVerified: {
      email: user.isEmailVerified ?? false,
      phone: user.isPhoneVerified ?? false,
    },
    privacy: user.isPrivate ? 'private' : 'public',
    // Set relation to undefined if it's the current user (so Message button is hidden)
    relation: isCurrentUser ? undefined : (user as any).relation,
  };

  return (
    <div className="space-y-8">
       <div className="md:hidden flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">{profileUser.username}</h1>
      </div>
      <ProfileHeader user={profileUser as any} />
    </div>
  );
}
