
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, FlatList, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  host_id: string;
  is_private: boolean;
  require_approval: boolean;
  allow_plus_one: boolean;
  join_type: string;
  tags: string[];
  created_at: string;
  host?: {
    username: string;
    full_name: string;
  };
}

const filters = ['Distance', 'Trending', 'Tonight'];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [selectedFilter, setSelectedFilter] = useState('Distance');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('🔍 Fetching events from Supabase...');
      
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:host_id (
            username,
            full_name
          )
        `)
        .eq('is_private', false)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (error) {
        console.error('❌ Error fetching events:', error);
        Alert.alert('Error', 'Failed to load events');
        return;
      }

      console.log('✅ Events fetched successfully:', eventsData?.length || 0);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('💥 Unexpected error fetching events:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading events');
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getEventImageColor = (index: number) => {
    const colors = ['#1a1a2e', '#e91e63', '#0a0a0a', '#8bc34a', '#ff9800', '#9c27b0', '#2196f3'];
    return colors[index % colors.length];
  };

  const getEventImageContent = (title: string, index: number) => {
    const emojis = ['🎉', '🎧', '✦', '🎸', '🎊', '🎭', '🎪'];
    return emojis[index % emojis.length];
  };

  const renderEventCard = ({ item, index }: { item: Event; index: number }) => (
    <TouchableOpacity style={styles.eventCard} onPress={() => router.push(`/event/${item.id}`)}>
      <View style={[styles.eventImage, { backgroundColor: getEventImageColor(index) }]}>
        <ThemedText style={styles.eventImageText}>
          {getEventImageContent(item.title, index)}
        </ThemedText>
      </View>
      <View style={styles.eventInfo}>
        <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.eventDetails}>
          {formatEventDate(item.date_time)} · {item.location}
        </ThemedText>
        <ThemedText style={styles.eventHost}>
          Hosted by {item.host?.full_name || item.host?.username || 'Unknown'}
        </ThemedText>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.tag}>
                <ThemedText style={styles.tagText}>{tag}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.placeholderImage}>
        <ThemedText style={styles.placeholderImageText}>🎉</ThemedText>
      </View>
      <ThemedText style={styles.noEventsText}>No events yet</ThemedText>
      <ThemedText style={styles.supportText}>
        Be the first to create an event in your area!
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <IconSymbol size={24} name="location" color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Events</ThemedText>
        <TouchableOpacity style={styles.headerIcon} onPress={fetchEvents}>
          <IconSymbol size={24} name="arrow.clockwise" color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonSelected
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <View style={styles.filterContent}>
              {filter === 'Distance' && <IconSymbol size={16} name="location" color={selectedFilter === filter ? "#6750a4" : "#888"} />}
              {filter === 'Trending' && <IconSymbol size={16} name="chart.line.uptrend.xyaxis" color={selectedFilter === filter ? "#6750a4" : "#888"} />}
              {filter === 'Tonight' && <IconSymbol size={16} name="moon" color={selectedFilter === filter ? "#6750a4" : "#888"} />}
              <ThemedText
                style={[
                  styles.filterText,
                  { 
                    color: selectedFilter === filter ? "#6750a4" : "#AAA",
                    fontWeight: selectedFilter === filter ? '600' : '400'
                  }
                ]}
              >
                {filter}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750a4" />
          <ThemedText style={styles.loadingText}>Loading events...</ThemedText>
        </View>
      ) : (
        /* Events List */
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.eventsList}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading}
          onRefresh={fetchEvents}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    marginHorizontal: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonSelected: {
    backgroundColor: '#f3edff',
    borderColor: '#6750a4',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#6750a4',
    fontSize: 16,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventImageText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  eventDetails: {
    fontSize: 14,
    color: '#6750a4',
    marginBottom: 4,
    fontWeight: '400',
  },
  eventHost: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3edff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    color: '#6750a4',
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3edff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderImageText: {
    fontSize: 32,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
