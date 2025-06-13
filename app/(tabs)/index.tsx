import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, RefreshControl, Platform } from 'react-native';
import { Text } from '@/components/ThemedText';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { supabase } from '@/services/database/supabase';
import { format } from 'date-fns';
import { Pressable } from 'react-native';
import { Link } from 'expo-router';
import { ActivityIndicator } from 'react-native';

interface Game {
  game_id: string;
  event_id: string;
  game_date: string;
  home_team_id: string;
  away_team_id: string;
  home_team_name: string;
  away_team_name: string;
  start_time: string;
  status: 'scheduled' | 'in_progress' | 'final';
  home_team_score?: number;
  away_team_score?: number;
  data_hash: string;
}

interface TeamRecord {
  team_id: string;
  wins: number;
  losses: number;
  win_percentage: number;
  last_10: string;
}

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const [games, setGames] = useState<Game[]>([]);
  const [teamRecords, setTeamRecords] = useState<{ [key: string]: TeamRecord }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's games with team information
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          home_team:teams!home_team_id(full_name),
          away_team:teams!away_team_id(full_name)
        `)
        .eq('game_date', today);

      if (gamesError) throw gamesError;

      // Transform the data to include team names
      const transformedGames = gamesData.map(game => ({
        ...game,
        home_team_name: game.home_team.full_name,
        away_team_name: game.away_team.full_name
      }));

      setGames(transformedGames);

      // Fetch team records for all teams playing today
      const teamIds = new Set([
        ...transformedGames.map(g => g.home_team_id),
        ...transformedGames.map(g => g.away_team_id)
      ]);

      const { data: recordsData, error: recordsError } = await supabase
        .rpc('get_team_records', {
          team_ids: Array.from(teamIds)
        });

      if (recordsError) throw recordsError;

      const recordsMap = recordsData.reduce((acc, record) => {
        acc[record.team_id] = record;
        return acc;
      }, {} as { [key: string]: TeamRecord });

      setTeamRecords(recordsMap);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    
    // Set up real-time subscription for game updates
    const subscription = supabase
      .channel('games_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games'
        },
        (payload) => {
          fetchGames(); // Refresh games on any update
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchGames]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  }, [fetchGames]);

  const renderGameCard = (game: Game) => {
    const homeRecord = teamRecords[game.home_team_id];
    const awayRecord = teamRecords[game.away_team_id];

    return (
      <Link
        key={game.game_id}
        href={{
          pathname: "/matchup/[id]",
          params: { id: game.event_id }
        }}
        asChild
      >
        <Pressable style={({ pressed }) => [
          styles.gameCard,
          {
            backgroundColor: Colors[colorScheme].cardBackground,
            opacity: pressed ? 0.9 : 1
          }
        ]}>
          <View style={styles.gameHeader}>
            <Text style={styles.gameTime}>
              {format(new Date(game.start_time), 'h:mm a')}
            </Text>
            {game.status === 'in_progress' && (
              <Text style={styles.liveIndicator}>LIVE</Text>
            )}
          </View>

          <View style={styles.teamContainer}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{game.away_team_name}</Text>
              <Text style={styles.record}>
                {awayRecord ? `(${awayRecord.wins}-${awayRecord.losses})` : ''}
              </Text>
              {game.away_team_score !== undefined && (
                <Text style={styles.score}>{game.away_team_score}</Text>
              )}
            </View>

            <Text style={styles.vs}>@</Text>

            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{game.home_team_name}</Text>
              <Text style={styles.record}>
                {homeRecord ? `(${homeRecord.wins}-${homeRecord.losses})` : ''}
              </Text>
              {game.home_team_score !== undefined && (
                <Text style={styles.score}>{game.home_team_score}</Text>
              )}
            </View>
          </View>

          {game.status === 'scheduled' && (
            <View style={styles.lastTenContainer}>
              <Text style={styles.lastTenLabel}>Last 10:</Text>
              <Text style={styles.lastTenRecord}>
                {awayRecord?.last_10} vs {homeRecord?.last_10}
              </Text>
            </View>
          )}
        </Pressable>
      </Link>
    );
  };

  return (
    <ParallaxScrollView
      style={styles.container}
      backgroundColor={Colors[colorScheme].background}
      parallaxHeaderHeight={100}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors[colorScheme].text}
        />
      }
      renderForeground={() => (
        <View style={styles.header}>
          <Text style={styles.title}>Today's Games</Text>
          <Text style={styles.date}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>
      )}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme].tint}
            style={styles.loader}
          />
        ) : games.length === 0 ? (
          <View style={styles.noGames}>
            <Text style={styles.noGamesText}>No games scheduled for today</Text>
          </View>
        ) : (
          games.map(renderGameCard)
        )}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
  },
  date: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loader: {
    marginTop: 20,
  },
  noGames: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  noGamesText: {
    fontSize: 18,
    textAlign: 'center',
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameTime: {
    fontSize: 14,
  },
  liveIndicator: {
    fontSize: 12,
    color: '#ff0000',
    fontWeight: 'bold',
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  record: {
    fontSize: 14,
    marginTop: 4,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  vs: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  lastTenContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  lastTenLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  lastTenRecord: {
    fontSize: 14,
    fontWeight: '600',
  },
});