
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

  const formatEventTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleTimeString('en-US', options);
  };

  const getEventImageColor = (index: number) => {
    const colors = ['#1a1a2e', '#e91e63', '#0a0a0a', '#8bc34a', '#ff9800', '#9c27b0', '#2196f3'];
    return colors[index % colors.length];
  };

  const getEventImageContent = (title: string, index: number) => {
    const emojis = ['🎉', '🎧', '✦', '🎸', '🎊', '🎭', '🎪'];
    return emojis[index % emojis.length];
  };

  const getHostDisplayName = (event: Event) => {
    if (event.host?.full_name) {
      return event.host.full_name;
    }
    if (event.host?.username) {
      return event.host.username;
    }
    return 'Anonymous Host';
  };

  const getHostInitials = (event: Event) => {
    const name = getHostDisplayName(event);
    if (name === 'Anonymous Host') return 'AH';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderEventCard = ({ item, index }: { item: Event; index: number }) => (
    <TouchableOpacity 
      style={styles.eventCard} 
      onPress={() => router.push(`/event/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.eventImage, { backgroundColor: getEventImageColor(index) }]}>
        <View style={styles.eventImageOverlay}>
          <ThemedText style={styles.eventImageText}>
            {getEventImageContent(item.title, index)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.eventInfo}>
        <ThemedText style={styles.eventTitle}>
          {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
        </ThemedText>
        
        <View style={styles.eventDateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <IconSymbol size={14} name="calendar" color="#7B61FF" />
            <ThemedText style={styles.eventDate}>
              {formatEventDate(item.date_time)}
            </ThemedText>
          </View>
          <View style={styles.dateTimeRow}>
            <IconSymbol size={14} name="clock" color="#7B61FF" />
            <ThemedText style={styles.eventTime}>
              {formatEventTime(item.date_time)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.locationRow}>
          <IconSymbol size={14} name="location" color="#7B61FF" />
          <ThemedText style={styles.eventLocation}>
            {item.location}
          </ThemedText>
        </View>

        <View style={styles.hostRow}>
          <View style={styles.hostAvatar}>
            <ThemedText style={styles.hostInitials}>
              {getHostInitials(item)}
            </ThemedText>
          </View>
          <ThemedText style={styles.eventHost}>
            Hosted by {getHostDisplayName(item)}
          </ThemedText>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, tagIndex) => (
              <View key={tagIndex} style={styles.tag}>
                <ThemedText style={styles.tagText}>#{tag}</ThemedText>
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
          <IconSymbol size={24} name="location" color="#7B61FF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Events</ThemedText>
        <TouchableOpacity style={styles.headerIcon} onPress={fetchEvents}>
          <IconSymbol size={24} name="arrow.clockwise" color="#7B61FF" />
        </TouchableOpacity>
      </View>

      {/* Modern Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterSegmentedControl}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonSelected
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}
            >
              <View style={styles.filterContent}>
                {filter === 'Distance' && (
                  <IconSymbol 
                    size={16} 
                    name="location" 
                    color={selectedFilter === filter ? "#FFFFFF" : "#AAA"} 
                  />
                )}
                {filter === 'Trending' && (
                  <IconSymbol 
                    size={16} 
                    name="chart.line.uptrend.xyaxis" 
                    color={selectedFilter === filter ? "#FFFFFF" : "#AAA"} 
                  />
                )}
                {filter === 'Tonight' && (
                  <IconSymbol 
                    size={16} 
                    name="moon" 
                    color={selectedFilter === filter ? "#FFFFFF" : "#AAA"} 
                  />
                )}
                <ThemedText
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextSelected
                  ]}
                >
                  {filter}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B61FF" />
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
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterSegmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonSelected: {
    backgroundColor: '#7B61FF',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AAA',
  },
  filterTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#7B61FF',
    fontSize: 16,
    fontWeight: '500',
  },
  eventsList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  eventImage: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eventImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventImageText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 12,
    lineHeight: 24,
  },
  eventDateTimeContainer: {
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#7B61FF',
    fontWeight: '500',
    marginLeft: 6,
  },
  eventTime: {
    fontSize: 14,
    color: '#7B61FF',
    fontWeight: '500',
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventLocation: {
    fontSize: 14,
    color: '#7B61FF',
    fontWeight: '500',
    marginLeft: 6,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  hostInitials: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7B61FF',
  },
  eventHost: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3EDFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#7B61FF',
    fontWeight: '600',
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
    backgroundColor: '#F3EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderImageText: {
    fontSize: 32,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
