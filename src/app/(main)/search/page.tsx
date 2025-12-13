'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Search as SearchIcon,
  User,
  Hash,
  MapPin,
  X,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { posts, users } from '@/lib/data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('top');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() !== '') {
      setIsSearching(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsSearching(false);
  };

  const searchSuggestions = [
    'serene landscapes',
    'mindful cooking',
    'minimalist architecture',
  ];

  const recentSearches = [
    { type: 'account', value: 'miaw', user: users[1] },
    { type: 'text', value: 'positive affirmations' },
    { type: 'account', value: 'leorivera', user: users[2] },
  ];

  const suggestionPills = [
    'meditation',
    'nature',
    'journaling',
    'calm',
    'art',
  ];

  const searchResults = posts.flatMap((p) => p.media).slice(0, 15);

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
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Tags
          </TabsTrigger>
          <TabsTrigger
            value="places"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
          >
            Places
          </TabsTrigger>
        </TabsList>
        <TabsContent value="top">
          <div className="mt-4">
            <h2 className="px-4 text-lg font-bold">Recent</h2>
            <ul className="mt-2">
              {recentSearches.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent"
                >
                  {item.type === 'account' && item.user ? (
                    <Link
                      href={`/profile/${item.user.username}`}
                      className="flex w-full items-center gap-4"
                    >
                      <Avatar className="h-11 w-11">
                        <AvatarImage
                          src={item.user.avatar.imageUrl}
                          data-ai-hint={item.user.avatar.imageHint}
                        />
                        <AvatarFallback>
                          {item.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{item.user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.user.name}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="accounts">
          <p className="p-4 text-muted-foreground">
            Search for accounts to follow.
          </p>
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
          >
            {pill}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {searchResults.map((media, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={media.imageUrl}
              alt={media.description}
              fill
              className="object-cover"
              data-ai-hint={media.imageHint}
            />
          </div>
        ))}
      </div>
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
