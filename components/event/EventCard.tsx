import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Spacing, BorderRadius, FontSizes } from "@/constants/theme";

export interface Event {
  id: string;
  date: string;
  time: string;
  name: string;
  eventDateTime: string; // ISO format: "2024-11-18T19:00:00"
  category: 'game' | 'community'; // Event category
}

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const [countdown, setCountdown] = useState("");
  const [isHappening, setIsHappening] = useState(false);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const eventTime = new Date(event.eventDateTime);
      const diffMs = eventTime.getTime() - now.getTime();

      // Event is happening now (within 3 hours of start time)
      if (diffMs < 0 && Math.abs(diffMs) < 3 * 60 * 60 * 1000) {
        setIsHappening(true);
        setCountdown("Happening Now");
        return;
      }

      // Event hasn't started yet
      if (diffMs > 0) {
        setIsHappening(false);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
          const days = Math.floor(hours / 24);
          setCountdown(`${days}d ${hours % 24}h`);
        } else if (hours > 0) {
          setCountdown(`${hours}h ${minutes}m`);
        } else {
          setCountdown(`${minutes}m`);
        }
      } else {
        // Event has passed
        setIsHappening(false);
        setCountdown("Ended");
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [event.eventDateTime]);

  return (
    <View style={styles.container}>
      {/* Status Badge - Top Right */}
      {isHappening && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>LIVE</Text>
        </View>
      )}

      {/* Event Date Section */}
      <View style={styles.dateSection}>
        <Text style={styles.dateText}>{event.date}</Text>
        <Text style={styles.eventTime}>{event.time}</Text>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={1}>{event.name}</Text>

        {/* Countdown */}
        <Text style={styles.countdownText}>{countdown}</Text>
      </View>

      {/* View Link - Bottom Right */}
      <TouchableOpacity style={styles.viewLink}>
        <Text style={styles.viewLinkText}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    height: 80, // Fixed height
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.lg,
    marginRight: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    shadowColor: Colors.fhsuBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: Spacing.xs,
    elevation: 3,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.red,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
    zIndex: 1,
  },
  statusBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.fhsuWhite,
    letterSpacing: 0.5,
  },
  dateSection: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.fhsuGold,
    borderRadius: BorderRadius.sm,
  },
  dateText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.fhsuBlack,
    textAlign: 'center',
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  eventName: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  eventTime: {
    fontSize: FontSizes.xs,
  },
  countdownText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.textSecondary, 
  },
  viewLink: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.lg,
  },
  viewLinkText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
    letterSpacing: 0.3,
  },
});
