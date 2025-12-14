'use client';

import { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { userService, chatService } from '@/lib/api';
import type { User } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('accounts');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [topResults, setTopResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [topLoading, setTopLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Array<{ type: 'account' | 'text'; value: string; user?: User }>>([]);
  const router = useRouter();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
    
    // Load users by default for Accounts tab
    loadUsers();
  }, []);

  const loadUsers = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const response = await userService.listUsers({ 
        search: searchQuery,
        pageSize: 20 
      });
      
      if (response.success && response.data) {
        // Handle both response structures: data.data or data.users
        const users = (response.data as any).users || response.data.data || [];
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopUsers = async () => {
    try {
      setTopLoading(true);
      const response = await userService.listUsers({ 
        pageSize: 20 
      });
      
      if (response.success && response.data) {
        // Handle both response structures: data.data or data.users
        const users = (response.data as any).users || response.data.data || [];
        setTopResults(users);
      }
    } catch (error) {
      console.error('Error loading top users:', error);
    } finally {
      setTopLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'top') {
      loadTopUsers();
    } else if (activeTab === 'accounts' && !isSearching) {
      loadUsers();
    }
  }, [activeTab]);

  const saveRecentSearch = (search: { type: 'account' | 'text'; value: string; user?: User }) => {
    const updated = [search, ...recentSearches.filter(s => s.value !== search.value)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery === '') {
      setIsSearching(false);
      loadUsers(); // Load default users when search is cleared
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const response = await userService.listUsers({ 
        search: trimmedQuery, 
        pageSize: 50 
      });
      
      if (response.success && response.data) {
        // Handle both response structures: data.data or data.users
        const users = (response.data as any).users || response.data.data || [];
        setSearchResults(users);
        // Save to recent searches
        if (users.length > 0) {
          saveRecentSearch({ type: 'account', value: trimmedQuery, user: users[0] });
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: User, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Create or find conversation with this user
      const response = await chatService.createOrFindConversation({
        participantId: user.id,
      });

      if (response.success && response.data) {
        // Navigate to chat page with conversation ID
        router.push(`/chat?conversationId=${response.data.id}`);
      } else {
        console.error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsSearching(false);
    loadUsers(); // Load default users when search is cleared
  };

  const suggestionPills = [
    'meditation',
    'nature',
    'journaling',
    'calm',
    'art',
  ];

  const renderInitialView = () => (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-transparent p-0">
          <TabsTrigger
            value="top"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Top
          </TabsTrigger>
          <TabsTrigger
            value="accounts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="tags"
            disabled
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none opacity-50 cursor-not-allowed"
          >
            Tags
          </TabsTrigger>
          <TabsTrigger
            value="places"
            disabled
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none opacity-50 cursor-not-allowed"
          >
            Places
          </TabsTrigger>
        </TabsList>
        <TabsContent value="top">
          <div className="mt-4">
            {topLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topResults.length === 0 ? (
              <p className="p-4 text-muted-foreground">
                No users found.
              </p>
            ) : (
              <ul className="mt-2">
                {topResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-accent cursor-pointer"
                    onClick={(e) => handleUserClick(user, e)}
                  >
                    <div className="flex w-full items-center gap-4">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={user.profileImage || ''} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.bio || 'No bio'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.followersCount} followers
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
        <TabsContent value="accounts">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <p className="p-4 text-muted-foreground">
              No users found.
            </p>
          ) : (
            <div className="mt-4">
              <ul className="mt-2">
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-accent cursor-pointer"
                    onClick={(e) => handleUserClick(user, e)}
                  >
                    <div className="flex w-full items-center gap-4">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={user.profileImage || ''} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.bio || 'No bio'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.followersCount} followers
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>
        <TabsContent value="tags">
          <p className="p-4 text-muted-foreground">
            Search for posts with specific tags.
          </p>
        </TabsContent>
        <TabsContent value="places">
          <p className="p-4 text-muted-foreground">
            Find posts from specific locations.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderSearchResults = () => (
    <div>
      <div className="flex space-x-2 overflow-x-auto p-4 scrollbar-hide">
        {suggestionPills.map((pill) => (
          <Button
            key={pill}
            variant="secondary"
            className="flex-shrink-0 rounded-lg"
            onClick={() => {
              setQuery(pill);
              // Trigger search
              setIsSearching(true);
              setLoading(true);
              userService.listUsers({ search: pill, pageSize: 50 })
                .then(response => {
                  if (response.success && response.data) {
                    // Handle both response structures: data.data or data.users
                    const users = (response.data as any).users || response.data.data || [];
                    setSearchResults(users);
                  }
                })
                .catch(error => console.error('Error searching:', error))
                .finally(() => setLoading(false));
            }}
          >
            {pill}
          </Button>
        ))}
      </div>
      {loading ? (
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p>No users found for "{query}"</p>
        </div>
      ) : (
        <div className="mt-4">
          <ul>
            {searchResults.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent cursor-pointer"
                onClick={(e) => handleUserClick(user, e)}
              >
                <div className="flex w-full items-center gap-4">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={user.profileImage || ''} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.bio || 'No bio'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.followersCount} followers
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] md:h-auto">
      <div className="sticky top-0 z-10 bg-background/80 px-4 py-2 backdrop-blur-sm md:px-0">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="h-11 rounded-xl bg-secondary pl-10 focus:bg-background"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearching(false)}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </form>
      </div>

      <div className="-mx-4 h-full overflow-y-auto md:mx-0">
        {isSearching ? renderSearchResults() : renderInitialView()}
      </div>
    </div>
  );
};

export default SearchPage;
