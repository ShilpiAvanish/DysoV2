
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
      console.log('🔍 Fetching event details for ID:', id);
      
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

      console.log('✅ Event details fetched successfully:', eventData);
      setEvent(eventData);
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
          <ActivityIndicator size="large" color="#6750a4" />
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
        {/* Event Flyer */}
        <View style={styles.flyerContainer}>
          <View style={styles.flyer}>
            <ThemedText style={styles.flyerText}>{event.title.toUpperCase()}</ThemedText>
            <View style={styles.flyerCircle} />
            <ThemedText style={styles.flyerSubtext}>EVENT • PARTY • VIBES</ThemedText>
            <ThemedText style={styles.flyerSubtext}>{formatEventDate(event.date_time)}</ThemedText>
          </View>
          
          {/* Top Icons */}
          <View style={styles.topIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <IconSymbol size={24} name="chevron.left" color="#1C1B1F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <IconSymbol size={24} name="square.and.arrow.up" color="#1C1B1F" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Event Info Block */}
          <View style={styles.eventInfoSection}>
            <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
            <ThemedText style={styles.hostInfo}>
              Hosted by {event.host?.full_name || event.host?.username || 'Unknown'}
            </ThemedText>
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{tag}</ThemedText>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Details</ThemedText>
            
            {/* Address */}
            <View style={styles.detailRow}>
              <IconSymbol size={20} name="location" color="#1C1B1F" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailText}>{event.address || event.location}</ThemedText>
                <TouchableOpacity onPress={handleViewMap}>
                  <ThemedText style={styles.linkText}>View on Map</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.detailRow}>
              <IconSymbol size={20} name="calendar" color="#1C1B1F" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailText}>{formatEventDate(event.date_time)}</ThemedText>
              </View>
            </View>

            {/* Admission */}
            <View style={styles.detailRow}>
              <IconSymbol size={20} name="ticket" color="#1C1B1F" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailText}>
                  {event.join_type === 'tickets' ? 'Ticketed Event' : 'RSVP Required'}
                </ThemedText>
              </View>
            </View>

            {/* Event Description */}
            <ThemedText style={styles.description}>{event.description}</ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* RSVP/Ticket Button */}
        <TouchableOpacity 
          style={[styles.rsvpButton, isGoing && styles.rsvpButtonActive]} 
          onPress={handleRSVP}
        >
          <ThemedText style={[styles.rsvpButtonText, isGoing && styles.rsvpButtonTextActive]}>
            {isGoing ? 'Going ✓' : (event.join_type === 'tickets' ? 'Get Tickets' : 'RSVP')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6750a4',
    fontSize: 16,
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
    backgroundColor: '#6750a4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  flyerContainer: {
    height: 400,
    position: 'relative',
  },
  flyer: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flyerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 20,
  },
  flyerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#1C1B1F',
    marginBottom: 20,
  },
  flyerSubtext: {
    fontSize: 10,
    color: '#1C1B1F',
    textAlign: 'center',
    marginBottom: 4,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  eventInfoSection: {
    marginBottom: 32,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  hostInfo: {
    fontSize: 16,
    color: '#7B3EFF',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#f3edff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6750a4',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#1C1B1F',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#7B3EFF',
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 16,
    color: '#1C1B1F',
    lineHeight: 24,
    marginTop: 16,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rsvpButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rsvpButtonActive: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rsvpButtonTextActive: {
    color: '#4CAF50',
  },
});
