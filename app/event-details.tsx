import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  address?: string;
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

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoing, setIsGoing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching event details for ID:', id);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      const { data: eventData, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:host_id (
            username,
            full_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching event details:', error);
        Alert.alert('Error', 'Failed to load event details');
        return;
      }

      if (!eventData) {
        console.error('❌ No event found with ID:', id);
        Alert.alert('Error', 'Event not found');
        return;
      }

      // Transform the data to match our interface
      const transformedEvent: Event = {
        ...eventData,
        host: eventData.profiles
      };

      console.log('✅ Event details fetched successfully:', eventData);
      setEvent(transformedEvent);

      // Check if user has RSVP'd if they're logged in
      if (user) {
        const { data: rsvpData } = await supabase
          .from('rsvps')
          .select('status')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single();

        if (rsvpData && rsvpData.status === 'going') {
          setIsGoing(true);
          console.log('✅ User is already RSVP\'d to this event');
        } else {
          setIsGoing(false);
          console.log('ℹ️ User has not RSVP\'d to this event');
        }
      }
    } catch (error) {
      console.error('💥 Unexpected error fetching event details:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading event details');
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

  const handleRSVP = () => {
    setIsGoing(!isGoing);
    console.log(isGoing ? 'Removed RSVP' : 'RSVP confirmed');
  };

  const handleShare = () => {
    console.log('Share event');
  };

  const handleViewMap = () => {
    console.log('View on map');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B61FF" />
          <ThemedText style={styles.loadingText}>Loading event details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Event not found</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Modern Event Header */}
        <View style={styles.headerContainer}>
          {/* Flyer Image/Gradient Placeholder */}
          <View style={styles.flyerImage}>
            <View style={styles.flyerGradient} />
            <View style={styles.flyerOverlay}>
              <ThemedText style={styles.flyerEmoji}>🎉</ThemedText>
            </View>
          </View>

          {/* Top Navigation Icons */}
          <View style={styles.topIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <IconSymbol size={24} name="chevron.left" color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <IconSymbol size={24} name="square.and.arrow.up" color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Event Title */}
          <View style={styles.titleContainer}>
            <ThemedText style={styles.eventTitle}>
              {event.title.toUpperCase()}
            </ThemedText>

            {/* Event Type Badges */}
            <View style={styles.badgesContainer}>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>EVENT</ThemedText>
              </View>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>PARTY</ThemedText>
              </View>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>VIBES</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.eventDate}>
              {formatEventDate(event.date_time)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Host Section */}
          <View style={styles.hostSection}>
            <View style={styles.hostRow}>
              <View style={styles.hostAvatar}>
                <ThemedText style={styles.hostInitials}>
                  {getHostInitials(event)}
                </ThemedText>
              </View>
              <View style={styles.hostInfo}>
                <ThemedText style={styles.hostLabel}>Hosted by</ThemedText>
                <ThemedText style={styles.hostName}>
                  {getHostDisplayName(event)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Event Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Details Section */}
          <View style={styles.detailsSection}>
            <ThemedText style={styles.sectionTitle}>Details</ThemedText>

            {/* Location Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <IconSymbol size={20} name="location" color="#7B61FF" />
                <ThemedText style={styles.detailLabel}>Location</ThemedText>
              </View>
              <ThemedText style={styles.detailText}>
                {event.address || event.location}
              </ThemedText>
              <TouchableOpacity style={styles.mapButton} onPress={handleViewMap}>
                <IconSymbol size={16} name="map" color="#7B61FF" />
                <ThemedText style={styles.mapButtonText}>View on Map</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Date & Time Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <IconSymbol size={20} name="calendar" color="#7B61FF" />
                <ThemedText style={styles.detailLabel}>Date & Time</ThemedText>
              </View>
              <View style={styles.dateTimeInfo}>
                <View style={styles.dateTimeRow}>
                  <IconSymbol size={16} name="calendar" color="#666666" />
                  <ThemedText style={styles.dateTimeText}>
                    {formatEventDate(event.date_time)}
                  </ThemedText>
                </View>
                <View style={styles.dateTimeRow}>
                  <IconSymbol size={16} name="clock" color="#666666" />
                  <ThemedText style={styles.dateTimeText}>
                    {formatEventTime(event.date_time)}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Event Type Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <IconSymbol size={20} name="ticket" color="#7B61FF" />
                <ThemedText style={styles.detailLabel}>Event Type</ThemedText>
              </View>
              <View style={styles.eventTypeBadge}>
                <IconSymbol 
                  size={16} 
                  name={event.join_type === 'tickets' ? "ticket" : "person.2"} 
                  color="#FFFFFF" 
                />
                <ThemedText style={styles.eventTypeText}>
                  {event.join_type === 'tickets' ? '🎟 Ticketed' : '📝 Free RSVP'}
                </ThemedText>
              </View>
            </View>

            {/* Event Description */}
            {event.description && (
              <View style={styles.descriptionCard}>
                <ThemedText style={styles.descriptionLabel}>About this event</ThemedText>
                <ThemedText style={styles.description}>{event.description}</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modern Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[styles.actionButton, isGoing && styles.actionButtonActive]} 
          onPress={handleRSVP}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.actionButtonText, isGoing && styles.actionButtonTextActive]}>
            {isGoing ? 'Going ✓' : (event.join_type === 'tickets' ? 'Get Tickets' : 'RSVP')}
          </ThemedText>
          {event.join_type === 'tickets' && (
            <ThemedText style={styles.priceText}>Starting at $10</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7B61FF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#1C1B1F',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#7B61FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
  },
  flyerImage: {
    height: 300,
    position: 'relative',
  },
  flyerGradient: {
    flex: 1,
    backgroundColor: '#7B61FF',
  },
  flyerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  flyerEmoji: {
    fontSize: 64,
  },
  topIcons: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#F3EDFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#7B61FF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  eventDate: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  hostSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hostInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7B61FF',
  },
  hostInfo: {
    flex: 1,
  },
  hostLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  hostName: {
    fontSize: 18,
    color: '#7B61FF',
    fontWeight: '600',
  },
  tagsSection: {
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#F3EDFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#7B61FF',
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginLeft: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '500',
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3EDFF',
    borderRadius: 8,
  },
  mapButtonText: {
    fontSize: 14,
    color: '#7B61FF',
    fontWeight: '600',
    marginLeft: 6,
  },
  dateTimeInfo: {
    gap: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '500',
    marginLeft: 8,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B61FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  eventTypeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#1C1B1F',
    lineHeight: 24,
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    backgroundColor: '#7B61FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonActive: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.9,
  },
});