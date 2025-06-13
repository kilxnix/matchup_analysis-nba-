import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/services/database/supabase';

interface Team {
  team_id: string;
  full_name: string;
  conference: 'Eastern' | 'Western';
  division: string;
}

interface MatchupStats {
  team_id: string;
  avg_points: number;
  avg_rebounds: number;
  avg_assists: number;
  avg_steals: number;
  avg_blocks: number;
  fg_percentage: number;
  three_pt_percentage: number;
  common_opponents: string[];
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam1, setSelectedTeam1] = useState<string>('');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [matchupStats, setMatchupStats] = useState<{
    team1: MatchupStats | null;
    team2: MatchupStats | null;
  }>({ team1: null, team2: null });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setTeams(data as Team[]);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const analyzeMatchup = async () => {
    if (!selectedTeam1 || !selectedTeam2) return;
    
    setLoading(true);
    try {
      // Fetch common opponents and statistics
      const { data: statsData, error: statsError } = await supabase
        .rpc('analyze_matchup', {
          team1_id: selectedTeam1,
          team2_id: selectedTeam2
        });

      if (statsError) throw statsError;

      setMatchupStats({
        team1: statsData.team1_stats,
        team2: statsData.team2_stats
      });
    } catch (error) {
      console.error('Error analyzing matchup:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeam1 && selectedTeam2) {
      analyzeMatchup();
    }
  }, [selectedTeam1, selectedTeam2]);

  const renderStatComparison = (
    label: string,
    stat1: number | undefined,
    stat2: number | undefined
  ) => (
    <View style={styles.statRow}>
      <Text style={styles.statValue}>{stat1?.toFixed(1)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{stat2?.toFixed(1)}</Text>
    </View>
  );

  return (
    <ParallaxScrollView
      style={styles.container}
      backgroundColor={Colors[colorScheme].background}
      parallaxHeaderHeight={100}
      renderForeground={() => (
        <View style={styles.header}>
          <Text style={styles.title}>Matchup Analysis</Text>
        </View>
      )}>
      <View style={styles.content}>
        <View style={styles.selectionContainer}>
          <Picker
            selectedValue={selectedTeam1}
            onValueChange={setSelectedTeam1}
            style={styles.picker}>
            <Picker.Item label="Select Team 1" value="" />
            {teams.map((team) => (
              <Picker.Item
                key={team.team_id}
                label={team.full_name}
                value={team.team_id}
              />
            ))}
          </Picker>

          <Text style={styles.vs}>VS</Text>

          <Picker
            selectedValue={selectedTeam2}
            onValueChange={setSelectedTeam2}
            style={styles.picker}>
            <Picker.Item label="Select Team 2" value="" />
            {teams.map((team) => (
              <Picker.Item
                key={team.team_id}
                label={team.full_name}
                value={team.team_id}
              />
            ))}
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        ) : (
          matchupStats.team1 && matchupStats.team2 && (
            <ScrollView style={styles.statsContainer}>
              {renderStatComparison(
                'Points',
                matchupStats.team1.avg_points,
                matchupStats.team2.avg_points
              )}
              {renderStatComparison(
                'Rebounds',
                matchupStats.team1.avg_rebounds,
                matchupStats.team2.avg_rebounds
              )}
              {renderStatComparison(
                'Assists',
                matchupStats.team1.avg_assists,
                matchupStats.team2.avg_assists
              )}
              {renderStatComparison(
                'FG%',
                matchupStats.team1.fg_percentage,
                matchupStats.team2.fg_percentage
              )}
              {renderStatComparison(
                '3PT%',
                matchupStats.team1.three_pt_percentage,
                matchupStats.team2.three_pt_percentage
              )}
              
              <View style={styles.commonOpponents}>
                <Text style={styles.sectionTitle}>Common Opponents</Text>
                {matchupStats.team1.common_opponents.map((opponent) => (
                  <Text key={opponent} style={styles.opponentText}>
                    {opponent}
                  </Text>
                ))}
              </View>
            </ScrollView>
          )
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
  content: {
    flex: 1,
    padding: 16,
  },
  selectionContainer: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    marginVertical: 10,
  },
  vs: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  statsContainer: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statLabel: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
    textAlign: 'center',
  },
  commonOpponents: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  opponentText: {
    fontSize: 16,
    marginVertical: 4,
  },
});