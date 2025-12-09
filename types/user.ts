export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  profileImageUrl?: string;
  pushToken?: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface AdminInvitation {
  id: string;
  inviteCode: string;
  email?: string;
  createdById: string;
  usedById?: string;
  isUsed: boolean;
  expiresAt?: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface EventAttendance {
  id: string;
  userId: string;
  eventId: string;
  status: 'PENDING' | 'CHECKED_IN' | 'NO_SHOW';
  checkedInAt?: Date;
  checkOutAt?: Date;
  deviceInfo?: any;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
