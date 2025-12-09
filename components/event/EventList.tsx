import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, FontSizes } from "@/constants/theme";
import EventCard, { Event } from "./EventCard";

interface EventListProps {
  events?: Event[];
  showHeader?: boolean;
  filterCategory?: 'all' | 'game' | 'community';
  limit?: number; // Limit number of events to display
  searchQuery?: string; // Search query for filtering events
  dateFilter?: 'allTime' | 'today' | 'thisWeek' | 'thisMonth'; // Date range filter
  sortOrder?: 'earliest' | 'latest'; // Sort order
}

export default function EventList({
  events,
  showHeader = true,
  filterCategory = 'all',
  limit,
  searchQuery = '',
  dateFilter = 'allTime',
  sortOrder = 'earliest'
}: EventListProps) {
  const router = useRouter();
  // Sample events data with real countdown times
  const now = new Date();

  // Event happening now (started 1 hour ago)
  const happeningNow = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  // Event in 2 hours
  const upcoming1 = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Event tomorrow
  const upcoming2 = new Date(now.getTime() + 26 * 60 * 60 * 1000);

  const sampleEvents: Event[] = [
    {
      id: "1",
      date: "Nov 18",
      time: "7:00 PM",
      name: "Basketball vs Kansas",
      eventDateTime: happeningNow.toISOString(),
      category: 'game',
    },
    {
      id: "2",
      date: "Nov 20",
      time: "3:00 PM",
      name: "Football vs Missouri",
      eventDateTime: upcoming1.toISOString(),
      category: 'game',
    },
    {
      id: "3",
      date: "Nov 22",
      time: "6:00 PM",
      name: "Volleyball vs Nebraska",
      eventDateTime: upcoming2.toISOString(),
      category: 'game',
    },
    {
      id: "4",
      date: "Nov 19",
      time: "5:00 PM",
      name: "Career Fair",
      eventDateTime: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      category: 'community',
    },
    {
      id: "5",
      date: "Nov 21",
      time: "7:30 PM",
      name: "Student Art Exhibition",
      eventDateTime: new Date(now.getTime() + 28 * 60 * 60 * 1000).toISOString(),
      category: 'community',
    },
    {
      id: "6",
      date: "Nov 23",
      time: "12:00 PM",
      name: "Community Lunch",
      eventDateTime: new Date(now.getTime() + 50 * 60 * 60 * 1000).toISOString(),
      category: 'community',
    },
  ];

  // Filter and sort events
  let eventData = events || sampleEvents;

  // 1. Filter by category
  if (filterCategory !== 'all') {
    eventData = eventData.filter(event => event.category === filterCategory);
  }

  // 2. Filter by search query
  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();
    eventData = eventData.filter(event =>
      event.name.toLowerCase().includes(query) ||
      event.date.toLowerCase().includes(query)
    );
  }

  // 3. Filter by date range
  if (dateFilter !== 'allTime') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    eventData = eventData.filter(event => {
      const eventDate = new Date(event.eventDateTime);
      eventDate.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        return eventDate.getTime() === today.getTime();
      } else if (dateFilter === 'thisWeek') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        return eventDate >= today && eventDate <= weekFromNow;
      } else if (dateFilter === 'thisMonth') {
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(today.getMonth() + 1);
        return eventDate >= today && eventDate <= monthFromNow;
      }
      return true;
    });
  }

  // 4. Sort by date
  eventData = [...eventData].sort((a, b) => {
    const dateA = new Date(a.eventDateTime).getTime();
    const dateB = new Date(b.eventDateTime).getTime();
    return sortOrder === 'earliest' ? dateA - dateB : dateB - dateA;
  });

  // 5. Limit number of events if specified
  if (limit) {
    eventData = eventData.slice(0, limit);
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.title}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/event')}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Events List */}
      {limit ? (
        // Use simple map for limited lists (avoids nested FlatList warning)
        <View>
          {eventData.map((item) => (
            <EventCard key={item.id} event={item} />
          ))}
        </View>
      ) : (
        <FlatList
          data={eventData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '600', // Bolder for modern look
    color: Colors.textPrimary,
    letterSpacing: -0.5, // Tighter letter spacing for modern typography
  },
  viewMoreText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray,
    letterSpacing: 0.3,
  },
});
