import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useUserStore } from '@/stores/userStore';
import { syncUserToDatabase, getUserByClerkId } from '@/lib/userSync';

/**
 * Hook to sync Clerk user with database and load user role
 * Call this in app/_layout.tsx to initialize user on app launch
 */
export function useUserSync() {
  const { user: clerkUser } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const { user, setUser, setLoading, setError, isAdmin, isGuest } = useUserStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      setUser(null);
      return;
    }

    const syncUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get existing user
        let dbUser = await getUserByClerkId(clerkUser.id);

        // If user doesn't exist, sync from Clerk
        if (!dbUser) {
          dbUser = await syncUserToDatabase(clerkUser);
        }

        if (dbUser) {
          setUser(dbUser);
        } else {
          setError('Failed to load user profile');
        }
      } catch (err) {
        console.error('Error syncing user:', err);
        setError('Failed to sync user');
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  return {
    user,
    isAdmin: isAdmin(),
    isGuest: isGuest(),
    isLoading: useUserStore((state) => state.isLoading),
    error: useUserStore((state) => state.error),
  };
}
