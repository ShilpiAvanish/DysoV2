
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert, ActivityIndicator, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

const tabs = ['Attending', 'Saved', 'Hosting', 'Hosted'];

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  university: string;
  birthday: string;
  gender: string;
  phone_number: string;
  created_at: string;
}

interface HostedEvent {
  id: string;
  title: string;
  date_time: string;
  location: string;
  require_approval: boolean;
  attendee_count: number;
}

interface PastEvent {
  id: string;
  title: string;
  date_time: string;
  location: string;
  require_approval: boolean;
  attendee_count: number;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Attending');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hostedEvents, setHostedEvents] = useState<HostedEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'Hosting' && profile) {
      fetchHostedEvents();
    } else if (activeTab === 'Hosted' && profile) {
      fetchPastEvents();
    }
  }, [activeTab, profile]);

  const fetchProfile = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to view your profile');
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        Alert.alert('Error', 'Failed to load profile data');
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHostedEvents = async () => {
    if (!profile) return;
    
    setIsLoadingEvents(true);
    try {
      console.log('🔍 Fetching hosted events for user:', profile.id);
      
      // Get events that haven't been completed yet (date_time > now)
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date_time,
          location,
          require_approval,
          event_attendees!inner(count)
        `)
        .eq('host_id', profile.id)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (error) {
        console.error('❌ Error fetching hosted events:', error);
        Alert.alert('Error', 'Failed to load your hosted events');
        return;
      }

      // Process the data to get attendee counts
      const processedEvents = await Promise.all(
        (eventsData || []).map(async (event) => {
          // Get actual attendee count
          const { count, error: countError } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'approved');

          if (countError) {
            console.error('Error getting attendee count:', countError);
          }

          return {
            id: event.id,
            title: event.title,
            date_time: event.date_time,
            location: event.location,
            require_approval: event.require_approval,
            attendee_count: count || 0,
          };
        })
      );

      console.log('✅ Hosted events fetched successfully:', processedEvents.length);
      setHostedEvents(processedEvents);
    } catch (error) {
      console.error('💥 Unexpected error fetching hosted events:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your events');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchPastEvents = async () => {
    if (!profile) return;
    
    setIsLoadingEvents(true);
    try {
      console.log('🔍 Fetching past events for user:', profile.id);
      
      // Get events that have already passed (date_time < now)
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date_time,
          location,
          require_approval,
          event_attendees!inner(count)
        `)
        .eq('host_id', profile.id)
        .lt('date_time', new Date().toISOString())
        .order('date_time', { ascending: false });

      if (error) {
        console.error('❌ Error fetching past events:', error);
        Alert.alert('Error', 'Failed to load your past events');
        return;
      }

      // Process the data to get attendee counts
      const processedEvents = await Promise.all(
        (eventsData || []).map(async (event) => {
          // Get actual attendee count
          const { count, error: countError } = await supabase
            .from('event_attendees')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'approved');

          if (countError) {
            console.error('Error getting attendee count:', countError);
          }

          return {
            id: event.id,
            title: event.title,
            date_time: event.date_time,
            location: event.location,
            require_approval: event.require_approval,
            attendee_count: count || 0,
          };
        })
      );

      console.log('✅ Past events fetched successfully:', processedEvents.length);
      setPastEvents(processedEvents);
    } catch (error) {
      console.error('💥 Unexpected error fetching past events:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your past events');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  

  const formatEventDateTime = (dateTimeString: string) => {
    const eventDate = new Date(dateTimeString);
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString();
    const isTomorrow = eventDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    
    let dateText = '';
    if (isToday) {
      dateText = 'Today';
    } else if (isTomorrow) {
      dateText = 'Tomorrow';
    } else {
      dateText = eventDate.toLocaleDateString('en-US', dateOptions);
    }
    
    const timeText = eventDate.toLocaleTimeString('en-US', timeOptions);
    return `${dateText} at ${timeText}`;
  };

  const renderHostedEventCard = ({ item }: { item: HostedEvent }) => (
    <View style={styles.hostedEventCard}>
      <View style={styles.hostedEventHeader}>
        <ThemedText style={styles.hostedEventTitle}>{item.title}</ThemedText>
        <View style={styles.approvalBadge}>
          <ThemedText style={[
            styles.approvalText,
            { color: item.require_approval ? '#FF6B35' : '#4CAF50' }
          ]}>
            {item.require_approval ? 'Approval Required' : 'Open Event'}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.hostedEventDetails}>
        <View style={styles.hostedEventRow}>
          <IconSymbol size={16} name="calendar" color="#6750A4" />
          <ThemedText style={styles.hostedEventDateTime}>
            {formatEventDateTime(item.date_time)}
          </ThemedText>
        </View>
        
        <View style={styles.hostedEventRow}>
          <IconSymbol size={16} name="location" color="#6750A4" />
          <ThemedText style={styles.hostedEventLocation}>{item.location}</ThemedText>
        </View>
        
        <View style={styles.hostedEventRow}>
          <IconSymbol size={16} name="person.2" color="#6750A4" />
          <ThemedText style={styles.hostedEventAttendees}>
            {item.attendee_count} {item.attendee_count === 1 ? 'attendee' : 'attendees'}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderPastEventCard = ({ item }: { item: PastEvent }) => (
    <View style={styles.pastEventCard}>
      <View style={styles.hostedEventHeader}>
        <ThemedText style={styles.hostedEventTitle}>{item.title}</ThemedText>
        <View style={[styles.approvalBadge, styles.completedBadge]}>
          <ThemedText style={[styles.approvalText, styles.completedText]}>
            Completed
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.hostedEventDetails}>
        <View style={styles.hostedEventRow}>
          <IconSymbol size={16} name="calendar" color="#888888" />
          <ThemedText style={styles.pastEventDateTime}>
            {formatEventDateTime(item.date_time)}
          </ThemedText>
        </View>
        
        <View style={styles.hostedEventRow}>
          <IconSymbol size={16} name="location" color="#888888" />
          <ThemedText style={styles.pastEventLocation}>{item.location}</ThemedText>
        </View>
        
        <View style={styles.hostedEventRow}>
          <IconSymbol size={16} name="person.2" color="#888888" />
          <ThemedText style={styles.pastEventAttendees}>
            {item.attendee_count} {item.attendee_count === 1 ? 'attendee' : 'attendees'}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderHostingContent = () => {
    if (isLoadingEvents) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <ThemedText style={styles.loadingText}>Loading your events...</ThemedText>
        </View>
      );
    }

    if (hostedEvents.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={styles.placeholderImage}>
            <ThemedText style={styles.placeholderImageText}>🎉</ThemedText>
          </View>
          <ThemedText style={styles.noEventsText}>No upcoming events</ThemedText>
          <ThemedText style={styles.supportText}>
            You haven't created any upcoming events yet. Start hosting and bring people together!
          </ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={hostedEvents}
        renderItem={renderHostedEventCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hostedEventsList}
      />
    );
  };

  const renderHostedContent = () => {
    if (isLoadingEvents) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <ThemedText style={styles.loadingText}>Loading your past events...</ThemedText>
        </View>
      );
    }

    if (pastEvents.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={styles.placeholderImage}>
            <ThemedText style={styles.placeholderImageText}>📅</ThemedText>
          </View>
          <ThemedText style={styles.noEventsText}>No past events</ThemedText>
          <ThemedText style={styles.supportText}>
            You haven't hosted any events yet. Your completed events will appear here!
          </ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={pastEvents}
        renderItem={renderPastEventCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hostedEventsList}
      />
    );
  };

  const handleEditProfile = () => {
    router.push('/setup-profile');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6750A4" />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Profile not found</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <ThemedText style={styles.profileEmoji}>👤</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.profileName}>
            {profile.full_name || 'No name provided'}
          </ThemedText>
          <ThemedText style={styles.profileHandle}>
            @{profile.username}
          </ThemedText>
          <ThemedText style={styles.profileUniversity}>
            {profile.university || 'No university specified'}
          </ThemedText>
          
          <ThemedText style={styles.profileBio}>
            {profile.bio || 'No bio provided yet.'}
          </ThemedText>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === tab ? styles.activeTabText : styles.inactiveTabText
                ]}
              >
                {tab}
              </ThemedText>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'Hosting' ? (
          renderHostingContent()
        ) : activeTab === 'Hosted' ? (
          renderHostedContent()
        ) : (
          /* Default Empty State for other tabs */
          <View style={styles.emptyStateContainer}>
            <View style={styles.placeholderImage}>
              <ThemedText style={styles.placeholderImageText}>📷</ThemedText>
            </View>
            <ThemedText style={styles.noEventsText}>No events yet</ThemedText>
            <ThemedText style={styles.supportText}>
              You haven't joined any events yet. Explore events and join the fun!
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FF',
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6750A4',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  errorText: {
    fontSize: 18,
    color: '#1C1B1F',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6750A4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profilePictureContainer: {
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  profileEmoji: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileUniversity: {
    fontSize: 16,
    color: '#6750A4',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  profileBio: {
    fontSize: 15,
    textAlign: 'center',
    color: '#4A4A4A',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  editButton: {
    backgroundColor: '#f0eefc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#1C1B1F',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: '#6750A4',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1C1B1F',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E8E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderImageText: {
    fontSize: 40,
    opacity: 0.6,
  },
  noEventsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },
  hostedEventsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  hostedEventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  hostedEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hostedEventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1B1F',
    flex: 1,
    marginRight: 12,
  },
  approvalBadge: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  approvalText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hostedEventDetails: {
    gap: 8,
  },
  hostedEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostedEventDateTime: {
    fontSize: 14,
    color: '#6750A4',
    fontWeight: '500',
  },
  hostedEventLocation: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  hostedEventAttendees: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  pastEventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    opacity: 0.8,
  },
  completedBadge: {
    backgroundColor: '#E8F5E8',
  },
  completedText: {
    color: '#2E7D2E',
  },
  pastEventDateTime: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  pastEventLocation: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  pastEventAttendees: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
});
