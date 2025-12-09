import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useSocket } from '@/hooks/useSocket';
import { useUserStore } from '@/stores/userStore';
import * as Device from 'expo-constants';

interface CheckInModalProps {
  visible: boolean;
  event: {
    id: string;
    title: string;
    facilityId: string;
    startTime: Date;
    imageUrl?: string;
  };
  onClose: () => void;
  onCheckIn: () => void;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function CheckInModal({ visible, event, onClose, onCheckIn }: CheckInModalProps) {
  const { joinEvent } = useSocket();
  const user = useUserStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleCheckIn = async () => {
    if (!user) {
      setError('Please sign in to check in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call check-in API
      const response = await fetch(`${API_URL}/api/attendance/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          eventId: event.id,
          deviceInfo: {
            platform: Device.default.platform,
            appVersion: Device.default.expoVersion,
          },
          sessionId: `${user.id}-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check in');
      }

      const attendance = await response.json();

      // Join Socket.io room for flash sync
      joinEvent(event.id, user.id, attendance.sessionId);

      setIsCheckedIn(true);
      onCheckIn();

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Check-in error:', err);
      setError(err.message || 'Failed to check in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.fhsuBlack} />
          </TouchableOpacity>

          {/* Event image */}
          {event.imageUrl && (
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={isCheckedIn ? 'checkmark-circle' : 'radio-button-on'}
              size={64}
              color={isCheckedIn ? '#4CAF50' : Colors.fhsuGold}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isCheckedIn ? 'Checked In!' : `${event.title} is Live!`}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {isCheckedIn
              ? "You're ready to experience the game with synchronized flash screens!"
              : 'Check in now to sync your screen with other fans!'}
          </Text>

          {/* Error message */}
          {error && <Text style={styles.error}>{error}</Text>}

          {/* Check-in button */}
          {!isCheckedIn && (
            <TouchableOpacity
              style={[styles.checkInButton, isLoading && styles.buttonDisabled]}
              onPress={handleCheckIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.fhsuBlack} />
              ) : (
                <>
                  <Ionicons name="flash" size={24} color={Colors.fhsuBlack} />
                  <Text style={styles.checkInButtonText}>Check In</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Success message */}
          {isCheckedIn && (
            <View style={styles.successContainer}>
              <Ionicons name="flash" size={20} color="#4CAF50" />
              <Text style={styles.successText}>
                Your screen will flash in sync with the crowd!
              </Text>
            </View>
          )}

          {/* Info */}
          <Text style={styles.infoText}>
            {isCheckedIn
              ? 'Keep the app open to stay synced'
              : 'Your screen will flash yellow and black in sync with all checked-in fans'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.x2l,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  error: {
    backgroundColor: '#FEE',
    color: '#C00',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
    width: '100%',
  },
  checkInButton: {
    backgroundColor: Colors.fhsuGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.x2l,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  checkInButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.fhsuBlack,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#E8F5E9',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: FontSizes.sm,
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoText: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
