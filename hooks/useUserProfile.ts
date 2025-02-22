import { useState, useEffect } from 'react';
import React from 'react';

export const PROFILE_PHOTOS = [
    'doctor.png',  // Default photo
    'gamer.png',
    'cool.png',
    'dino.png',
    'king.png',
    'raincoat.png',
    'schoolgirl.png',
    'ski.png',
    'diva.png',
];

interface UserProfile {
    userId: string;
    firstName: string;
    bio: string;
    coins: number;
    patientsCount: number;
    profilePhoto: string;
}

interface UserProfileParams {
    email?: string;
    userId?: string;
}

export const useUserProfile = (params: UserProfileParams | null) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Memoize the params to prevent infinite fetches
    const memoizedParams = React.useMemo(() => {
        if (!params) return null;
        return {
            email: params.email,
            userId: params.userId
        };
    }, [params?.email, params?.userId]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!params || !params.email && !params.userId) return;
        try {
            const queryParam = params.email ?
                `email=${params.email}` :
                `userId=${params.userId}`;

            const response = await fetch(`/api/user-info/profile?${queryParam}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const data = await response.json();
            setProfile(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update profile'));
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!memoizedParams) return;

            setIsLoading(true);
            try {
                const queryParam = memoizedParams.email ?
                    `email=${memoizedParams.email}` :
                    `userId=${memoizedParams.userId}`;

                const response = await fetch(`/api/user-info/profile?${queryParam}`);
                const data = await response.json();
                setProfile(data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError(error instanceof Error ? error : new Error('Failed to fetch user profile'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [memoizedParams]); // Use memoized params

    return { profile, isLoading, error, updateProfile };
}; 