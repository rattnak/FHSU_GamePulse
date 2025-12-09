import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export interface GameScore {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  quarter: string; // e.g., "Q1", "Q2", "HALF", "Q3", "Q4", "FINAL"
  timeRemaining?: string; // e.g., "5:23", "FINAL"
  isLive: boolean;
  sport?: string; // e.g., "Football", "Basketball"
  date?: string; // e.g., "Nov 15"
}

interface ScoreboardProps {
  games?: GameScore[];
}

function GameCard({ item }: { item: GameScore }) {
  const isFHSUHome = item.homeTeam.includes('FHSU');
  const isFHSUAway = item.awayTeam.includes('FHSU');
  const [awayLogoError, setAwayLogoError] = useState(false);
  const [homeLogoError, setHomeLogoError] = useState(false);

  const isAwayWinning = item.awayScore > item.homeScore;
  const isHomeWinning = item.homeScore > item.awayScore;
  const isFinal = item.quarter === 'FINAL';

  return (
    <View style={styles.gameCard}>
      {/* Header with Sport, Date, and Live Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.sportText}>{item.sport || 'Football'}</Text>
          <View style={styles.separator} />
          <Text style={styles.dateText}>{item.date || 'Today'}</Text>
        </View>
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Teams and Scores */}
      <View style={styles.teamsContainer}>
        {/* Away Team */}
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            {item.awayLogoUrl && !awayLogoError ? (
              <Image
                source={{ uri: item.awayLogoUrl }}
                style={styles.teamLogo}
                onError={() => setAwayLogoError(true)}
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Ionicons name="shield-outline" size={18} color={Colors.textSecondary} />
              </View>
            )}
            <Text
              style={[
                styles.teamName,
                isFHSUAway && styles.fhsuTeamName,
              ]}
              numberOfLines={1}
            >
              {item.awayTeam}
            </Text>
          </View>
          <Text
            style={[
              styles.scoreText,
              isAwayWinning && isFinal && styles.winningScore,
              isFHSUAway && isAwayWinning && styles.fhsuWinningScore,
            ]}
          >
            {item.awayScore}
          </Text>
        </View>

        {/* Home Team */}
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            {item.homeLogoUrl && !homeLogoError ? (
              <Image
                source={{ uri: item.homeLogoUrl }}
                style={styles.teamLogo}
                onError={() => setHomeLogoError(true)}
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Ionicons name="shield-outline" size={18} color={Colors.textSecondary} />
              </View>
            )}
            <Text
              style={[
                styles.teamName,
                isFHSUHome && styles.fhsuTeamName,
              ]}
              numberOfLines={1}
            >
              {item.homeTeam}
            </Text>
          </View>
          <Text
            style={[
              styles.scoreText,
              isHomeWinning && isFinal && styles.winningScore,
              isFHSUHome && isHomeWinning && styles.fhsuWinningScore,
            ]}
          >
            {item.homeScore}
          </Text>
        </View>
      </View>

      {/* Game Status Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>
          {item.quarter === 'FINAL' 
            ? 'Final' 
            : `${item.quarter}${item.timeRemaining ? ` • ${item.timeRemaining}` : ''}`
          }
        </Text>
      </View>
    </View>
  );
}

export default function Scoreboard({ games }: ScoreboardProps) {
  const router = useRouter();

  // Sample game data with logos
  const sampleGames: GameScore[] = [
    {
      id: '1',
      homeTeam: 'FHSU',
      awayTeam: 'WSU',
      homeScore: 28,
      awayScore: 21,
      homeLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Fort_Hays_State_Tigers_logo.svg/200px-Fort_Hays_State_Tigers_logo.svg.png',
      awayLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Washburn_Ichabods_logo.svg/200px-Washburn_Ichabods_logo.svg.png',
      quarter: 'Q3',
      timeRemaining: '8:45',
      isLive: true,
      sport: 'Football',
      date: 'Nov 15',
    },
    {
      id: '2',
      homeTeam: 'ESU',
      awayTeam: 'FHSU',
      homeScore: 14,
      awayScore: 24,
      homeLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/19/Emporia_State_Hornets_logo.svg/200px-Emporia_State_Hornets_logo.svg.png',
      awayLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Fort_Hays_State_Tigers_logo.svg/200px-Fort_Hays_State_Tigers_logo.svg.png',
      quarter: 'FINAL',
      timeRemaining: 'FINAL',
      isLive: false,
      sport: 'Football',
      date: 'Nov 8',
    },
    {
      id: '3',
      homeTeam: 'FHSU',
      awayTeam: 'PSU',
      homeScore: 35,
      awayScore: 28,
      homeLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Fort_Hays_State_Tigers_logo.svg/200px-Fort_Hays_State_Tigers_logo.svg.png',
      awayLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/Pittsburg_State_Gorillas_logo.svg/200px-Pittsburg_State_Gorillas_logo.svg.png',
      quarter: 'FINAL',
      timeRemaining: 'FINAL',
      isLive: false,
      sport: 'Football',
      date: 'Nov 1',
    },
  ];

  const allGames = games || sampleGames;

  // Filter to show only one live game (if any) and recent past games
  const liveGame = allGames.find(game => game.isLive);
  const pastGames = allGames.filter(game => !game.isLive).slice(0, 2);

  // If there's a live game, show it first, then past games. Otherwise just show past games.
  const gameData = liveGame ? [liveGame, ...pastGames] : pastGames.slice(0, 3);

  const renderGameCard = ({ item }: { item: GameScore }) => <GameCard item={item} />;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Scores</Text>
        <TouchableOpacity 
          onPress={() => router.push('https://fhsuathletics.com/facilities')}
          activeOpacity={0.7}
        >
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      </View>

      {/* Scoreboard List */}
      <FlatList
        horizontal
        data={gameData}
        keyExtractor={(item) => item.id}
        renderItem={renderGameCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    paddingBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  viewMoreText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.gray,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },

  // Game Card Styles
  gameCard: {
    width: 250,
    backgroundColor: Colors.cardBackground || '#FFFFFF',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    shadowColor: Colors.fhsuBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: Spacing.xs,
    elevation: 3,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sportText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textSecondary,
  },
  dateText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  // Live Badge - matches EventCard style
  liveBadge: {
    backgroundColor: Colors.red,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xs,
  },
  liveText: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.fhsuWhite,
    letterSpacing: 0.5,
  },

  // Teams Container
  teamsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  teamLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  placeholderLogo: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.border,
    borderRadius: 12,
  },
  teamName: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  fhsuTeamName: {
    fontWeight: '700',
    color: Colors.fhsuBlack,
  },
  scoreText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
    minWidth: 24,
    textAlign: 'right',
  },
  winningScore: {
    color: Colors.textPrimary,
  },
  fhsuWinningScore: {
    color: Colors.fhsuGold,
  },

  // Card Footer
  cardFooter: {
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  statusText: {
    paddingTop: Spacing.xs,
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});