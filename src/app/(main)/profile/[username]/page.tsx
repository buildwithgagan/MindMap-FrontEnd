
'use client';

import ProfileHeader from "@/components/profile/ProfileHeader";
import { users } from "@/lib/data";
import { notFound, useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams() as { username: string };
  const user = users.find(u => u.username === params.username || (params.username === 'me' && u.id === 'user-1'));

  if (!user) {
    notFound();
  }
  
  // Create a copy and remove relation for the 'me' user
  const profileUser = JSON.parse(JSON.stringify(user));
  if (params.username === 'me') {
    delete profileUser.relation;
  }


  return (
    <div className="space-y-8">
       <div className="md:hidden flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold">{profileUser.username}</h1>
      </div>
      <ProfileHeader user={profileUser} />
    </div>
  );
}
