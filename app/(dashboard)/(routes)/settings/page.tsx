'use client';

import { useState, useEffect } from 'react';
import { Settings } from "lucide-react";

import { Heading } from "@/components/heading";
import { SubscriptionButton } from "@/components/subscription-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  const [isPro, setIsPro] = useState(false);
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }
        const data = await response.json();
        setIsPro(data.isPro);
        setBio(data.userInfo?.bio || 'No bio available');
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error (e.g., show an error message to the user)
      }
    };

    fetchData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewBio(bio);
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch('/api/user-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio: newBio }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bio');
      }

      const updatedInfo = await response.json();
      setBio(updatedInfo.bio);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return ( 
    <div>
      <Heading
        title="Settings"
        description="Manage account settings."
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />
      <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          {isPro ? "You are currently on a Pro plan." : "You are currently on a free plan."}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Your Bio</h3>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Enter your bio"
              />
              <Button onClick={handleSaveClick}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p>{bio}</p>
              <Button onClick={handleEditClick}>Edit Bio</Button>
            </div>
          )}
        </div>
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
   );
}
 
export default SettingsPage;