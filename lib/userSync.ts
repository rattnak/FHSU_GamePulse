import { User, UserRole } from '@/types/user';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Syncs Clerk user to our database
 * Creates or updates user record
 */
export async function syncUserToDatabase(clerkUser: {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}): Promise<User | null> {
  try {
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    // Auto-assign admin role to default admin email
    const isDefaultAdmin = email === 'mongchanrattnak@gmail.com';

    const response = await fetch(`${API_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId: clerkUser.id,
        email,
        firstName: clerkUser.firstName ?? undefined,
        lastName: clerkUser.lastName ?? undefined,
        profileImageUrl: clerkUser.imageUrl,
        role: isDefaultAdmin ? 'ADMIN' : undefined, // Auto-promote default admin
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Sync failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`Failed to sync user: ${JSON.stringify(errorData)}`);
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}

/**
 * Fetches user from database by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/api/users/clerk/${clerkId}`);

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Updates user role (used when accepting admin invitation)
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user role');
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
}

/**
 * Registers push notification token for user
 */
export async function registerPushToken(userId: string, pushToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pushToken }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error registering push token:', error);
    return false;
  }
}
