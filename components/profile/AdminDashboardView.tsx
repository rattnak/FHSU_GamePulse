import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  Shadows,
  AnimationDurations,
  Gradients,
  IconSizes,
} from '@/constants/theme';
import { User } from '@/types/user';

interface AdminDashboardViewProps {
  user: User;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminDashboardView({ user }: AdminDashboardViewProps) {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'users'>('overview');
  const [adminCount, setAdminCount] = useState(0);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: AnimationDurations.slow,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAdminData();
    }
  }, [activeTab]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch admin count
      const countResponse = await fetch(`${API_URL}/api/users/admins/count`);
      if (countResponse.ok) {
        const { count } = await countResponse.json();
        setAdminCount(count);
      }

      // Fetch all admins
      const adminsResponse = await fetch(`${API_URL}/api/users/admins`);
      if (adminsResponse.ok) {
        const adminsList = await adminsResponse.json();
        setAdmins(adminsList);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
  };

  const generateInviteLink = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/invitations/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createdById: user.id,
          expiresInHours: 168, // 7 days
        }),
      });

      if (response.ok) {
        const { inviteLink } = await response.json();
        setInviteLink(inviteLink);

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        Alert.alert(
          'Invitation Created!',
          'Share this link with someone to give them admin access.',
          [
            {
              text: 'Copy Link',
              onPress: () => shareInviteLink(inviteLink),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      } else {
        throw new Error('Failed to generate invitation');
      }
    } catch (error) {
      console.error('Error generating invite:', error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Failed to generate invitation link');
    } finally {
      setIsLoading(false);
    }
  };

  const shareInviteLink = async (link: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await Share.share({
        message: `You've been invited to become an admin on FHSU GamePulse! Click here to accept: ${link}`,
        title: 'Admin Invitation',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSignOut = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
      { cancelable: true }
    );
  };

  const handleTabPress = (tab: 'overview' | 'events' | 'users') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  };

  const getInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const renderOverview = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.fhsuGold}
          colors={[Colors.fhsuGold]}
        />
      }
    >
      {/* Welcome Card with Gradient */}
      <LinearGradient colors={Gradients.primary} style={styles.welcomeCard}>
        <View style={styles.welcomeHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.adminStatusDot} />
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeTitle}>
              Welcome, {user.firstName || 'Admin'}!
            </Text>
            <Text style={styles.welcomeSubtitle}>{user.email}</Text>
          </View>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={IconSizes.xs} color={Colors.fhsuGold} />
          <Text style={styles.adminBadgeText}>Administrator</Text>
        </View>
      </LinearGradient>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, Shadows.md]}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(253, 185, 19, 0.15)' }]}>
            <Ionicons name="people" size={IconSizes.lg} color={Colors.fhsuGold} />
          </View>
          <Text style={styles.statValue}>{adminCount}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>

        <View style={[styles.statCard, Shadows.md]}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(40, 167, 69, 0.15)' }]}>
            <Ionicons name="calendar" size={IconSizes.lg} color={Colors.green} />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Live Events</Text>
        </View>

        <View style={[styles.statCard, Shadows.md]}>
          <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 123, 255, 0.15)' }]}>
            <Ionicons name="person-add" size={IconSizes.lg} color={Colors.blue} />
          </View>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Checked In</Text>
        </View>
      </View>

      {/* Admin Access Card */}
      <View style={[styles.card, Shadows.md]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(253, 185, 19, 0.15)' }]}>
            <Ionicons name="people" size={IconSizes.md} color={Colors.fhsuGold} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Admin Access</Text>
            <Text style={styles.cardSubtitle}>Manage administrator privileges</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.fhsuGold} style={{ marginVertical: Spacing.lg }} />
        ) : (
          <>
            <View style={styles.adminCountContainer}>
              <Text style={styles.adminCountText}>
                {adminCount} {adminCount === 1 ? 'admin has' : 'admins have'} access
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.inviteButton, Shadows.sm]}
              onPress={generateInviteLink}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Gradients.gold}
                style={styles.inviteButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="person-add" size={IconSizes.sm} color={Colors.fhsuBlack} />
                <Text style={styles.inviteButtonText}>Generate Invite Link</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Admins List */}
      {admins.filter((a) => a.id !== user.id).length > 0 && (
        <View style={[styles.card, Shadows.md]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 123, 255, 0.15)' }]}>
              <Ionicons name="shield-checkmark" size={IconSizes.md} color={Colors.blue} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Other Admins</Text>
              <Text style={styles.cardSubtitle}>
                {admins.filter((a) => a.id !== user.id).length} team member
                {admins.filter((a) => a.id !== user.id).length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {admins
            .filter((a) => a.id !== user.id)
            .map((admin, index) => (
              <View
                key={admin.id}
                style={[
                  styles.adminItem,
                  index === admins.filter((a) => a.id !== user.id).length - 1 && styles.adminItemLast,
                ]}
              >
                <View style={styles.adminAvatar}>
                  <Text style={styles.adminAvatarText}>
                    {admin.firstName && admin.lastName
                      ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
                      : admin.email.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.adminInfo}>
                  <Text style={styles.adminName}>
                    {admin.firstName && admin.lastName
                      ? `${admin.firstName} ${admin.lastName}`
                      : admin.email}
                  </Text>
                  <Text style={styles.adminEmail}>{admin.email}</Text>
                  {admin.lastActiveAt && (
                    <Text style={styles.adminLastActive}>
                      Last active: {new Date(admin.lastActiveAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <Ionicons name="shield-checkmark" size={IconSizes.sm} color={Colors.fhsuGold} />
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );

  const renderEvents = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyStateContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(40, 167, 69, 0.15)' }]}>
          <Ionicons name="calendar" size={IconSizes.x2l} color={Colors.green} />
        </View>
        <Text style={styles.placeholderText}>Event Management</Text>
        <Text style={styles.placeholderSubtext}>
          Manage live events, flash settings, and notifications
        </Text>
        <TouchableOpacity
          style={[styles.ctaButton, Shadows.sm]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Text style={styles.ctaButtonText}>Coming Soon</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <View style={styles.emptyStateContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: 'rgba(0, 123, 255, 0.15)' }]}>
          <Ionicons name="people" size={IconSizes.x2l} color={Colors.blue} />
        </View>
        <Text style={styles.placeholderText}>User Management</Text>
        <Text style={styles.placeholderSubtext}>View all users and send notifications</Text>
        <TouchableOpacity
          style={[styles.ctaButton, Shadows.sm]}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
        >
          <Text style={styles.ctaButtonText}>Coming Soon</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Tabs */}
      <View style={[styles.tabsContainer, Shadows.sm]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => handleTabPress('overview')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="speedometer"
            size={IconSizes.sm}
            color={activeTab === 'overview' ? Colors.fhsuGold : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => handleTabPress('events')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar"
            size={IconSizes.sm}
            color={activeTab === 'events' ? Colors.fhsuGold : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => handleTabPress('users')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people"
            size={IconSizes.sm}
            color={activeTab === 'users' ? Colors.fhsuGold : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'events' && renderEvents()}
      {activeTab === 'users' && renderUsers()}

      {/* Sign Out (at bottom) */}
      <View style={[styles.footer, Shadows.md]}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={IconSizes.sm} color="#DC3545" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.fhsuGold,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.fhsuGold,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  welcomeCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.fhsuGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.fhsuBlack,
  },
  adminStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.green,
    borderWidth: 3,
    borderColor: Colors.fhsuBlack,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: FontSizes.x2l,
    fontWeight: 'bold',
    color: Colors.fhsuGold,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.sm,
    color: '#fff',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(253, 185, 19, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  adminBadgeText: {
    fontSize: FontSizes.sm,
    color: Colors.fhsuGold,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSizes.x3l,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  adminCountContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  adminCountText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  inviteButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  inviteButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.fhsuBlack,
  },
  adminItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  adminItemLast: {
    borderBottomWidth: 0,
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.fhsuBlack,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  adminAvatarText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.fhsuGold,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  adminEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  adminLastActive: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  placeholderText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  placeholderSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: Colors.fhsuGold,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  ctaButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.fhsuBlack,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#DC3545',
    gap: Spacing.sm,
  },
  signOutText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#DC3545',
  },
});
