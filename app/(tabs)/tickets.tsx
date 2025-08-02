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
      console.log('🎫 Starting to fetch user tickets...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log('❌ No authenticated user found');
        Alert.alert('Error', 'You must be logged in to view your tickets');
        return;
      }

      console.log('✅ User authenticated:', user.id);

      // Debug: Check what's actually in the database
      console.log('🔍 Debug: Checking all ticket purchases for user...');
      const { data: allPurchases, error: debugError } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('user_id', user.id);

      if (debugError) {
        console.error('❌ Debug query error:', debugError);
      } else {
        console.log('📊 Debug: All purchases in database:', allPurchases?.length || 0, 'records');
        console.log('📋 Debug: Purchase details:', allPurchases);
      }

      // Fetch paid tickets from ticket_purchases table
      console.log('🔍 Fetching paid tickets from ticket_purchases...');
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('purchase_date', { ascending: true });

      if (purchaseError) {
        console.error('❌ Error fetching ticket purchases:', purchaseError);
        console.error('❌ Purchase error details:', JSON.stringify(purchaseError, null, 2));
      } else {
        console.log('✅ Paid tickets fetched:', purchaseData?.length || 0, 'records');
        console.log('📋 Purchase details:', purchaseData);
      }

      // Fetch ticket details for each purchase
      let enrichedPurchaseData = [];
      if (purchaseData && purchaseData.length > 0) {
        console.log('🔍 Fetching ticket and event details for each purchase...');
        
        for (const purchase of purchaseData) {
          console.log(`🔍 Fetching details for purchase ${purchase.id} with ticket_id ${purchase.ticket_id}`);
          
          // Fetch ticket details
          const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', purchase.ticket_id)
            .single();

          if (ticketError) {
            console.error(`❌ Error fetching ticket ${purchase.ticket_id}:`, ticketError);
            continue;
          }

          if (!ticketData) {
            console.error(`❌ No ticket found for ticket_id ${purchase.ticket_id}`);
            continue;
          }

          console.log(`✅ Ticket found:`, ticketData);

          // Fetch event details
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', ticketData.event_id)
            .single();

          if (eventError) {
            console.error(`❌ Error fetching event ${ticketData.event_id}:`, eventError);
            continue;
          }

          if (!eventData) {
            console.error(`❌ No event found for event_id ${ticketData.event_id}`);
            continue;
          }

          console.log(`✅ Event found:`, eventData);

          // Combine the data
          enrichedPurchaseData.push({
            ...purchase,
            ticket: ticketData,
            event: eventData
          });
        }

        console.log(`✅ Enriched purchase data:`, enrichedPurchaseData.length, 'records');
      }

      // Fetch free RSVPs from rsvps table
      console.log('🔍 Fetching RSVP data...');
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
        .eq('status', 'going')
        .order('events(date_time)', { ascending: true });

      if (rsvpError) {
        console.error('⚠️ Error fetching RSVP data:', rsvpError);
        console.error('⚠️ RSVP error details:', JSON.stringify(rsvpError, null, 2));
      } else {
        console.log('✅ RSVP data fetched:', rsvpData?.length || 0, 'records');
        console.log('📋 RSVP details:', rsvpData);
      }

      // Process and combine the data
      console.log('🔄 Combining paid tickets and RSVPs...');
      const combinedData: any[] = [];

      // Add paid tickets from ticket_purchases
      if (enrichedPurchaseData) {
        console.log('📋 Processing paid tickets:', enrichedPurchaseData.length, 'records');
        for (const purchase of enrichedPurchaseData) {
          console.log('🔍 Processing paid ticket:', {
            id: purchase.id,
            ticketId: purchase.ticket_id,
            amount: purchase.total_amount,
            quantity: purchase.quantity,
            status: purchase.status
          });

          // Check if tickets data exists and has events
          if (purchase.ticket && purchase.event) {
            
            combinedData.push({
              id: purchase.id,
              type: 'paid_ticket',
              purchase: purchase,
              ticket: purchase.ticket, // Access first ticket from array
              event: purchase.event, // Access first event from array
              attendance_type: 'ticket'
            });
            
            console.log('✅ Added paid ticket to combined data');
          } else {
            console.log('⚠️ Skipping ticket purchase - missing ticket or event data:', {
              hasTickets: !!purchase.ticket,
              ticketsLength: purchase.ticket?.length,
              hasEvents: !!purchase.event,
              eventsLength: purchase.event?.length
            });
          }
        }
      }

      // Add free RSVPs
      if (rsvpData) {
        console.log('📋 Processing RSVPs:', rsvpData.length, 'records');
        for (const rsvp of rsvpData) {
          console.log('🔍 Processing RSVP:', {
            id: rsvp.id,
            eventId: rsvp.event_id,
            status: rsvp.status
          });

          combinedData.push({
            id: rsvp.id,
            type: 'rsvp',
            rsvp: rsvp,
            event: rsvp.events,
            attendance_type: 'rsvp'
          });
        }
      }

      console.log('✅ Combined data:', combinedData.length, 'total records');
      console.log('📋 Combined data details:', combinedData);

      // Transform the data into UserTicket format
      console.log('🔄 Transforming', combinedData.length, 'records into UserTicket format...');
      const transformedTickets: UserTicket[] = combinedData.map((item, index) => {
        console.log(`🔄 Transforming record ${index + 1}:`, item);
        const event = item.event;
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

        if (item.type === 'paid_ticket') {
          const purchase = item.purchase;
          const ticket = item.ticket;
          
          ticketType = ticket.name || ticket.ticket_type || 'General Admission';
          
          console.log('🔍 Determining price for paid ticket:', {
            ticketId: ticket.id,
            ticketPrice: ticket.price,
            purchaseAmount: purchase.total_amount
          });
          
          // Use the actual amount paid from purchase data
          if (purchase.total_amount && parseFloat(purchase.total_amount) > 0) {
            price = `$${parseFloat(purchase.total_amount).toFixed(2)}`;
            console.log('✅ Using purchase amount:', price);
          } else {
            price = 'Free';
            console.log('✅ Using free price (zero purchase amount)');
          }
        } else if (item.type === 'rsvp') {
          ticketType = 'RSVP';
          price = 'Free';
          console.log('✅ RSVP ticket - showing free');
        }

        const transformedTicket = {
          id: item.id,
          eventName: event.title,
          date: formattedDate,
          location: event.address || event.location,
          ticketType,
          price,
          eventId: event.id,
          isPastEvent: eventDate < now
        };

        console.log(`✅ Transformed ticket ${index + 1}:`, transformedTicket);
        return transformedTicket;
      });

      console.log('✅ All transformed tickets:', transformedTickets.length, 'tickets');
      console.log('📋 Final tickets array:', transformedTickets);
      setTickets(transformedTickets);

    } catch (error) {
      console.error('💥 Unexpected error fetching tickets:', error);
      console.error('💥 Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'An unexpected error occurred while loading your tickets');
    } finally {
      console.log('🏁 Fetch tickets completed, setting loading to false');
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
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchUserTickets}
            activeOpacity={0.8}
          >
            <IconSymbol size={20} name="arrow.clockwise" color="#7B3EFF" />
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
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