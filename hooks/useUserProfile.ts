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
    userId: string; // This might be problematic if GET /api/user-info doesn't return it.
    firstName: string;
    bio: string;
    coins: number;
    patientsCount: number;
    profilePhoto: string; // This is not in UserInfo from GET /api/user-info
}

// Define a type for the expected response from GET /api/user-info (simplified UserInfo)
interface ApiUserInfo {
    firstName?: string;
    bio?: string;
    score?: number;
    patientRecord?: {
        patientsTreated?: number;
    };
    // Add other fields from UserInfo that might be needed by UserProfile
    // For now, profilePhoto is managed locally or needs another source.
    // userId is also not directly in the response from GET /api/user-info
}

interface UserProfileParams {
    email?: string;
    userId?: string; // userId can be used if fetching for a different user by admin, but GET /api/user-info uses email or authenticated user.
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
        // PUT /api/user-info operates on the authenticated user, so queryParams are not needed.
        // if (!params || !params.email && !params.userId) return; // Keep this if the hook is intended for other users' profiles via email/userId for admins

        // For updating the current authenticated user, params might not be strictly necessary for the API call itself,
        // but the hook might use them for other logic or to identify whose profile is being updated locally.

        try {
            // Transform updates for the backend
            const backendUpdates: Record<string, any> = {};
            if (updates.bio !== undefined) {
                backendUpdates.bio = updates.bio;
            }
            if (updates.coins !== undefined) {
                // Assuming the backend PUT expects 'amount' for score updates
                backendUpdates.amount = updates.coins;
            }
            // Other fields like firstName, profilePhoto are not directly updatable by PUT /api/user-info's current handler.
            // If updates for these are passed, they will be ignored by the backend unless the handler is changed.

            if (Object.keys(backendUpdates).length === 0) {
                console.log("No updatable fields provided to updateProfile.");
                return; // Or throw an error, or handle as appropriate
            }

            const response = await fetch(`/api/user-info`, { // Changed to PUT /api/user-info
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendUpdates) // Send transformed updates
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
            }

            const data: ApiUserInfo = await response.json(); // Expecting UserInfo-like response

            // Update local profile state from the response
            // It's important that the PUT response returns the updated user object
            setProfile(prevProfile => ({
                // Fallback to existing profile data if not returned by API or if it's partial
                userId: prevProfile?.userId || (memoizedParams?.userId || memoizedParams?.email || ''), // userId is tricky, might need to get from auth context
                firstName: data.firstName || prevProfile?.firstName || '',
                bio: data.bio || prevProfile?.bio || '',
                coins: data.score !== undefined ? data.score : (prevProfile?.coins || 0),
                patientsCount: data.patientRecord?.patientsTreated !== undefined ? data.patientRecord.patientsTreated : (prevProfile?.patientsCount || 0),
                profilePhoto: prevProfile?.profilePhoto || PROFILE_PHOTOS[0], // profilePhoto not in API response
            }));
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to update profile'));
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!memoizedParams || (!memoizedParams.email && !memoizedParams.userId)) {
                // If no specific user is requested (e.g. viewing own profile),
                // fetch from /api/user-info without query params for the authenticated user.
                // However, the current hook design seems to always expect params.
                // For this subtask, we'll stick to the existing logic of requiring params.
                // If params are truly optional for "own profile", this logic would need adjustment.
                 setIsLoading(false); // Ensure loading is stopped if no fetch occurs
                 // setProfile(null); // Optionally clear profile if no params
                 return;
            }

            setIsLoading(true);
            try {
                let queryParam = "";
                if (memoizedParams.email) {
                    queryParam = `email=${memoizedParams.email}`;
                } else if (memoizedParams.userId) {
                    // GET /api/user-info doesn't use userId in query string, it uses email or authenticated user.
                    // If userId is provided, it implies fetching for another user, which /api/user-info
                    // handles if the authenticated user is an admin, typically via email.
                    // For this subtask, we'll assume if userId is given, it's for a context where email is preferred or it's the authed user.
                    // If this hook is for general user lookup by ID, the API would need to support it.
                    // For now, if only userId is present, we might not be able to form a valid query for /api/user-info
                    // unless we can convert userId to email or the API changes.
                    // Let's prioritize email if available, otherwise fetch for authenticated user (no query param).
                    // This part of the logic is a bit ambiguous based on current API.
                    // For now, let's assume email is the main identifier for other users.
                    // If no email, it will fetch for the authenticated user.
                    console.warn("Fetching by userId is not directly supported by GET /api/user-info query params, ensure email is available or it's for the authenticated user.");
                    // If only userId is provided, and it's not the authed user, this fetch might not work as intended.
                    // The original code used userId in param for /api/user-info/profile.
                    // GET /api/user-info uses 'email' or the authenticated user's session.
                    // We will proceed assuming 'email' is the primary external lookup.
                    // If no email and no userId, it implies current user. If userId is present but not email, it's an issue.
                }

                const response = await fetch(`/api/user-info${queryParam ? `?${queryParam}` : ''}`); // Changed to GET /api/user-info

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch profile: ${response.status} ${errorText}`);
                }

                const data: ApiUserInfo = await response.json();

                // Map ApiUserInfo to UserProfile
                setProfile({
                    userId: memoizedParams.userId || memoizedParams.email || '', // userId is not in response, get from params
                    firstName: data.firstName || '',
                    bio: data.bio || '',
                    coins: data.score !== undefined ? data.score : 0,
                    patientsCount: data.patientRecord?.patientsTreated !== undefined ? data.patientRecord.patientsTreated : 0,
                    profilePhoto: PROFILE_PHOTOS[0], // Default or manage separately, not in API response
                });
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