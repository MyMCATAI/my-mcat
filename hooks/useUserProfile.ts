import { useState, useEffect } from 'react';

interface UserProfile {
    firstName: string;
    bio: string;
    coins: number;
    patientsCount: number;
}

export function useUserProfile(email: string | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!email) return;
        try {
            const response = await fetch(`/api/user-info?email=${email}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio: updates.bio })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            const data = await response.json();
            setProfile(prev => prev ? { ...prev, ...updates } : null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update profile'));
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!email) {
                setProfile(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch(`/api/user-info/profile?email=${email}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [email]);

    return { profile, isLoading, error, updateProfile };
} 