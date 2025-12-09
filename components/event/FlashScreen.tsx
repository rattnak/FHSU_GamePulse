import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useSocket, FlashEvent } from '@/hooks/useSocket';
import * as Haptics from 'expo-haptics';

interface FlashScreenProps {
  eventId: string;
  enabled: boolean;
}

/**
 * Full-screen flash overlay component
 * Syncs with Socket.io flash events
 * Flashes colors in sync with all checked-in users
 */
export default function FlashScreen({ eventId, enabled }: FlashScreenProps) {
  const { onFlash } = useSocket();
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashColor, setFlashColor] = useState('#FDB913'); // FHSU Gold
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (!enabled) return;

    // Listen for flash events
    const unsubscribe = onFlash((flashEvent: FlashEvent) => {
      console.log('⚡ Flash event received:', flashEvent);
      triggerFlash(flashEvent.color, flashEvent.duration);
    });

    return () => {
      unsubscribe?.();
    };
  }, [enabled, eventId]);

  const triggerFlash = (color: string, duration: number) => {
    setFlashColor(color);
    setIsFlashing(true);

    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      // Hold for duration
      setTimeout(() => {
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          setIsFlashing(false);
        });
      }, duration);
    });
  };

  if (!enabled || !isFlashing) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.flashOverlay,
        {
          backgroundColor: flashColor,
          opacity,
        },
      ]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});
