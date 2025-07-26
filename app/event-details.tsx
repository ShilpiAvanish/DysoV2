
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

interface EventDetailsProps {
  // In a real app, this would come from route params or props
  event?: {
    id: string;
    title: string;
    host: string;
    tags: string[];
    address: string;
    date: string;
    admission: string;
    description: string;
    attendees: any[];
    isPrivate: boolean;
    ticketType: string;
    ticketPrice: string;
  };
}

export default function EventDetailsScreen({ event }: EventDetailsProps) {
  const router = useRouter();
  const [isGoing, setIsGoing] = useState(false);

  // Mock data - in real app this would come from props/route params
  const eventData = event || {
    id: '1',
    title: 'College Party',
    host: 'Alex',
    tags: ['Party', 'College', 'Nightlife'],
    address: '123 Main St, Anytown',
    date: 'Fri, Oct 27, 9 PM',
    admission: 'Free',
    description: 'Join us for the biggest college party of the year!\nMusic, drinks, and good vibes all night long.\nDon\'t miss out!',
    attendees: [1, 2, 3, 4, 5], // Mock attendee count
    isPrivate: true,
    ticketType: 'General Admission',
    ticketPrice: 'Free'
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Flyer */}
        <View style={styles.flyerContainer}>
          <View style={styles.flyer}>
            <ThemedText style={styles.flyerText}>MINIMAL PARTY</ThemedText>
            <View style={styles.flyerCircle} />
            <ThemedText style={styles.flyerSubtext}>DJs • BARTENDERS</ThemedText>
            <ThemedText style={styles.flyerSubtext}>DRINKS • VIBES • LATE STYLE</ThemedText>
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
            <ThemedText style={styles.eventTitle}>{eventData.title}</ThemedText>
            <ThemedText style={styles.hostInfo}>Hosted by {eventData.host}</ThemedText>
            
            {/* Tags */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
              {eventData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Details</ThemedText>
            
            {/* Address */}
            <View style={styles.detailRow}>
              <IconSymbol size={20} name="location" color="#1C1B1F" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailText}>{eventData.address}</ThemedText>
                <TouchableOpacity onPress={handleViewMap}>
                  <ThemedText style={styles.linkText}>View on Map</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.detailRow}>
              <IconSymbol size={20} name="calendar" color="#1C1B1F" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailText}>{eventData.date}</ThemedText>
              </View>
            </View>

            {/* Admission */}
            <View style={styles.detailRow}>
              <IconSymbol size={20} name="ticket" color="#1C1B1F" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailText}>{eventData.admission}</ThemedText>
              </View>
            </View>

            {/* Attendees Preview */}
            <View style={styles.attendeesContainer}>
              {eventData.attendees.slice(0, 5).map((_, index) => (
                <View key={index} style={[styles.attendeeAvatar, { zIndex: 5 - index }]}>
                  <ThemedText style={styles.attendeeInitial}>A</ThemedText>
                </View>
              ))}
            </View>

            {/* Event Description */}
            <ThemedText style={styles.description}>{eventData.description}</ThemedText>
          </View>

          {/* Tickets Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Tickets</ThemedText>
            <View style={styles.ticketRow}>
              <IconSymbol size={20} name="ticket" color="#1C1B1F" />
              <View style={styles.ticketContent}>
                <ThemedText style={styles.ticketType}>{eventData.ticketType}</ThemedText>
                <ThemedText style={styles.ticketPrice}>{eventData.ticketPrice}</ThemedText>
              </View>
            </View>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Privacy</ThemedText>
            <View style={styles.privacyRow}>
              <IconSymbol size={20} name="lock" color="#1C1B1F" />
              <ThemedText style={styles.privacyText}>
                {eventData.isPrivate ? 'Private' : 'Public'}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* RSVP Section */}
      <View style={styles.rsvpContainer}>
        {isGoing && (
          <View style={styles.goingBadge}>
            <ThemedText style={styles.goingText}>Going</ThemedText>
          </View>
        )}
        <TouchableOpacity style={styles.rsvpButton} onPress={handleRSVP}>
          <ThemedText style={styles.rsvpButtonText}>
            {isGoing ? 'Cancel RSVP' : 'RSVP'}
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
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#1C1B1F',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
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
    marginLeft: 12,
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    color: '#1C1B1F',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#7B3EFF',
    fontWeight: '500',
  },
  attendeesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginLeft: 32,
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7B3EFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  attendeeInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#1C1B1F',
    lineHeight: 24,
    marginLeft: 32,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketContent: {
    marginLeft: 12,
  },
  ticketType: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '500',
  },
  ticketPrice: {
    fontSize: 14,
    color: '#666666',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 16,
    color: '#1C1B1F',
    marginLeft: 12,
  },
  rsvpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  goingBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goingText: {
    fontSize: 14,
    color: '#1C1B1F',
    fontWeight: '500',
  },
  rsvpButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  rsvpButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
