
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface UserTicket {
  id: string;
  eventName: string;
  date: string;
  location: string;
  ticketType: string;
  price: string;
  eventId: string;
  isPastEvent: boolean;
}

export default function TicketsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('My Tickets');
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = ['My Tickets', 'Past Events'];

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      setIsLoading(true);
      console.log('🎫 Fetching user tickets...');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ User not authenticated:', userError);
        Alert.alert('Error', 'You must be logged in to view your tickets');
        return;
      }

      console.log('✅ User authenticated:', user.id);

      // Fetch user's event attendance (both RSVP and ticket purchases)
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('event_attendees')
        .select(`
          id,
          event_id,
          attendance_type,
          status,
          ticket_id,
          events!inner(
            id,
            title,
            date_time,
            location,
            address,
            join_type
          ),
          tickets(
            id,
            name,
            price,
            ticket_type
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['approved', 'pending'])
        .order('events(date_time)', { ascending: true });

      if (attendanceError) {
        console.error('❌ Error fetching attendance data:', attendanceError);
        Alert.alert('Error', 'Failed to load your tickets');
        return;
      }

      console.log('✅ Attendance data fetched:', attendanceData);

      // Also fetch direct RSVPs that might not be in event_attendees
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select(`
          id,
          event_id,
          status,
          events!inner(
            id,
            title,
            date_time,
            location,
            address,
            join_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'going');

      if (rsvpError) {
        console.error('⚠️ Error fetching RSVP data (non-critical):', rsvpError);
      } else {
        console.log('✅ RSVP data fetched:', rsvpData);
      }

      // Combine attendance data and RSVP data
      const allAttendanceData = [...(attendanceData || [])];
      
      // Add RSVPs that aren't already in attendance data
      if (rsvpData) {
        for (const rsvp of rsvpData) {
          const existsInAttendance = attendanceData?.some(
            attendance => attendance.event_id === rsvp.event_id
          );
          if (!existsInAttendance) {
            // Convert RSVP to attendance format
            allAttendanceData.push({
              id: rsvp.id,
              event_id: rsvp.event_id,
              attendance_type: 'rsvp',
              status: 'approved', // RSVPs in 'going' status are considered approved
              ticket_id: null,
              events: rsvp.events,
              tickets: null
            });
          }
        }
      }

      console.log('✅ Combined attendance data:', allAttendanceData);

      // Transform the data into UserTicket format
      const transformedTickets: UserTicket[] = allAttendanceData.map((attendance) => {
        const event = attendance.events;
        const ticket = attendance.tickets;
        const now = new Date();
        const eventDate = new Date(event.date_time);
        
        // Format date for display
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        let ticketType = 'General Admission';
        let price = 'Free';

        if (attendance.attendance_type === 'ticket' && ticket) {
          ticketType = ticket.name || ticket.ticket_type || 'General Admission';
          price = ticket.price && parseFloat(ticket.price) > 0 ? `$${ticket.price}` : 'Free';
        } else if (attendance.attendance_type === 'rsvp') {
          ticketType = 'RSVP';
          price = 'Free';
        }

        return {
          id: attendance.id,
          eventName: event.title,
          date: formattedDate,
          location: event.address || event.location,
          ticketType,
          price,
          eventId: event.id,
          isPastEvent: eventDate < now
        };
      });

      console.log('✅ Transformed tickets:', transformedTickets);
      setTickets(transformedTickets);

    } catch (error) {
      console.error('💥 Unexpected error fetching tickets:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketPress = (ticket: UserTicket) => {
    console.log('🎫 Ticket pressed:', ticket.eventName);
    // Navigate to event details
    router.push(`/event-details?id=${ticket.eventId}`);
  };

  // Filter tickets based on active tab
  const currentTickets = tickets.filter(ticket => {
    if (activeTab === 'My Tickets') {
      return !ticket.isPastEvent;
    } else {
      return ticket.isPastEvent;
    }
  });

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Tickets</ThemedText>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7B3EFF" />
            <ThemedText style={styles.loadingText}>Loading your tickets...</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Tickets</ThemedText>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
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

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {currentTickets.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <IconSymbol size={48} name="ticket" color="#CCCCCC" />
              </View>
              <ThemedText style={styles.emptyTitle}>No tickets yet</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                {activeTab === 'My Tickets' 
                  ? 'Your upcoming event tickets will appear here'
                  : 'Your past event tickets will appear here'
                }
              </ThemedText>
            </View>
          ) : (
            <View style={styles.ticketsContainer}>
              {currentTickets.map((ticket) => (
                <TouchableOpacity 
                  key={ticket.id} 
                  style={styles.ticketCard}
                  onPress={() => handleTicketPress(ticket)}
                  activeOpacity={0.8}
                >
                  <View style={styles.ticketContent}>
                    <View style={styles.ticketHeader}>
                      <ThemedText style={styles.eventName}>{ticket.eventName}</ThemedText>
                      <ThemedText style={styles.ticketPrice}>{ticket.price}</ThemedText>
                    </View>
                    <View style={styles.ticketDetails}>
                      <View style={styles.detailRow}>
                        <IconSymbol size={16} name="calendar" color="#666666" />
                        <ThemedText style={styles.detailText}>{ticket.date}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <IconSymbol size={16} name="location" color="#666666" />
                        <ThemedText style={styles.detailText}>{ticket.location}</ThemedText>
                      </View>
                      <View style={styles.detailRow}>
                        <IconSymbol size={16} name="ticket" color="#666666" />
                        <ThemedText style={styles.detailText}>{ticket.ticketType}</ThemedText>
                      </View>
                    </View>
                  </View>
                  <View style={styles.qrCodePlaceholder}>
                    <IconSymbol size={32} name="qrcode" color="#7B3EFF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7B3EFF',
    fontSize: 16,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginRight: 24,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#7B3EFF',
  },
  inactiveTabText: {
    color: '#666666',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#7B3EFF',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  ticketsContainer: {
    padding: 20,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ticketContent: {
    flex: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1B1F',
    flex: 1,
    marginRight: 12,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B3EFF',
  },
  ticketDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  qrCodePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
});
