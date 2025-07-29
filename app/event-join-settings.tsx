import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, Switch, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface Ticket {
  id: string;
  ticketType: string;
  ticketName: string;
  price: string;
  capacity: string;
  startDate: string;
  endDate: string;
  requireApproval: boolean;
}

export default function EventJoinSettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState('RSVP');
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowPlusOne, setAllowPlusOne] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Debug: Log initial params
  console.log('🎯 EventJoinSettingsScreen loaded with params:', params);

  const handleAddTicket = () => {
    // Preserve event parameters when navigating to add-ticket
    const eventParams: any = {};
    if (params.eventTitle && params.eventTitle !== 'undefined') {
      eventParams.eventTitle = params.eventTitle;
    }
    if (params.eventDate && params.eventDate !== 'undefined') {
      eventParams.eventDate = params.eventDate;
    }
    if (params.eventLocation && params.eventLocation !== 'undefined') {
      eventParams.eventLocation = params.eventLocation;
    }
    if (params.eventDescription && params.eventDescription !== 'undefined') {
      eventParams.eventDescription = params.eventDescription;
    }
    
    console.log('🎫 Navigating to add-ticket with event params:', eventParams);
    
    router.push({
      pathname: '/add-ticket',
      params: eventParams
    });
  };

  const handleEditTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      // Preserve event parameters when navigating to add-ticket
      const eventParams: any = {};
      if (params.eventTitle && params.eventTitle !== 'undefined') {
        eventParams.eventTitle = params.eventTitle;
      }
      if (params.eventDate && params.eventDate !== 'undefined') {
        eventParams.eventDate = params.eventDate;
      }
      if (params.eventLocation && params.eventLocation !== 'undefined') {
        eventParams.eventLocation = params.eventLocation;
      }
      if (params.eventDescription && params.eventDescription !== 'undefined') {
        eventParams.eventDescription = params.eventDescription;
      }
      
      console.log('🎫 Navigating to edit ticket with event params:', eventParams);
      
      router.push({
        pathname: '/add-ticket',
        params: {
          ...eventParams,
          editTicketId: ticketId,
          ticketType: ticket.ticketType,
          ticketName: ticket.ticketName,
          price: ticket.price,
          capacity: ticket.capacity,
          startDate: ticket.startDate,
          endDate: ticket.endDate,
          requireApproval: ticket.requireApproval.toString()
        }
      });
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
          }
        }
      ]
    );
  };

  // Listen for ticket data from add-ticket page
  useFocusEffect(
    React.useCallback(() => {
      // Check if we have ticket data in params (when returning from add-ticket)
      if (params.newTicket && params.newTicket !== 'undefined') {
        try {
          console.log('🎫 Received ticket data from add-ticket page:', params.newTicket);
          const ticketData = JSON.parse(params.newTicket as string);
          console.log('🎫 Parsed ticket data:', ticketData);
          
          if (params.editTicketId) {
            // Update existing ticket
            console.log('🔄 Updating existing ticket:', params.editTicketId);
            setTickets(prev => prev.map(ticket => 
              ticket.id === params.editTicketId ? { ...ticketData, id: params.editTicketId } : ticket
            ));
          } else {
            // Add new ticket
            console.log('➕ Adding new ticket to state');
            setTickets(prev => [...prev, { ...ticketData, id: Date.now().toString() }]);
          }
          
          // Clear the ticket params but preserve event params
          const eventParams: any = {};
          if (params.eventTitle && params.eventTitle !== 'undefined') {
            eventParams.eventTitle = params.eventTitle;
          }
          if (params.eventDate && params.eventDate !== 'undefined') {
            eventParams.eventDate = params.eventDate;
          }
          if (params.eventLocation && params.eventLocation !== 'undefined') {
            eventParams.eventLocation = params.eventLocation;
          }
          if (params.eventDescription && params.eventDescription !== 'undefined') {
            eventParams.eventDescription = params.eventDescription;
          }
          
          console.log('🔄 Preserving event params in useFocusEffect:', eventParams);
          
          router.setParams({ 
            newTicket: undefined, 
            editTicketId: undefined,
            ...eventParams
          });
        } catch (error) {
          console.error('❌ Error parsing ticket data:', error);
        }
      }
    }, [params.newTicket, params.editTicketId])
  );

  const convertDateToTimestamp = (dateString: string) => {
    // Validate that dateString exists and is not empty
    if (!dateString || typeof dateString !== 'string') {
      console.error('Invalid date string:', dateString);
      throw new Error('Event date is required');
    }
    
    // Convert MM/DD/YYYY to ISO timestamp
    const [month, day, year] = dateString.split('/');
    
    // Validate that we have all parts
    if (!month || !day || !year) {
      console.error('Invalid date format:', dateString);
      throw new Error('Please enter date in MM/DD/YYYY format');
    }
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    // Validate that the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      throw new Error('Please enter a valid date');
    }
    
    // Set time to 8 PM as default
    date.setHours(20, 0, 0, 0);
    return date.toISOString();
  };

  const handleCreateEvent = async () => {
    console.log('🎯 handleCreateEvent called with params:', params);
    console.log('🎫 Current tickets in state:', tickets);
    console.log('🎫 Selected option:', selectedOption);
    
    // Debug: Check each parameter individually
    console.log('🔍 Event Title:', params.eventTitle, 'Type:', typeof params.eventTitle);
    console.log('🔍 Event Date:', params.eventDate, 'Type:', typeof params.eventDate);
    console.log('🔍 Event Location:', params.eventLocation, 'Type:', typeof params.eventLocation);
    console.log('🔍 Event Description:', params.eventDescription, 'Type:', typeof params.eventDescription);
    
    // Validate required parameters
    if (!params.eventTitle || params.eventTitle === 'undefined') {
      Alert.alert('Error', 'Event title is required');
      return;
    }
    
    if (!params.eventDate || params.eventDate === 'undefined') {
      Alert.alert('Error', 'Event date is required');
      return;
    }
    
    if (!params.eventLocation || params.eventLocation === 'undefined') {
      Alert.alert('Error', 'Event location is required');
      return;
    }
    
    if (!params.eventDescription || params.eventDescription === 'undefined') {
      Alert.alert('Error', 'Event description is required');
      return;
    }
    
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to create an event');
        return;
      }

      // Prepare event data
      let dateTime;
      try {
        dateTime = convertDateToTimestamp(params.eventDate as string);
      } catch (error) {
        console.error('Date conversion error:', error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Invalid date format');
        setIsLoading(false);
        return;
      }
      
      const eventData = {
        title: params.eventTitle as string,
        description: params.eventDescription as string,
        host_id: user.id,
        date_time: dateTime,
        location: params.eventLocation as string,
        address: params.eventLocation as string, // Use location as address for now
        is_private: false, // Default to public
        require_approval: requireApproval,
        allow_plus_one: allowPlusOne,
        join_type: selectedOption.toLowerCase(), // 'rsvp' or 'tickets'
        tags: [], // Default empty array
      };

      console.log('Creating event with data:', eventData);

      // Insert event into Supabase
      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (eventError) {
        console.error('Error creating event:', eventError);
        Alert.alert('Error', 'Failed to create event. Please try again.');
        return;
      }

      console.log('Event created successfully:', newEvent);
      console.log('Event ID:', newEvent.id);

      // If tickets were added, save them to the database
      if (selectedOption === 'Tickets' && tickets.length > 0) {
        console.log('🎫 Saving tickets for event:', newEvent.id);
        console.log('Tickets to save:', tickets);
        
        const ticketData = tickets.map(ticket => ({
          event_id: newEvent.id, // This links the ticket to the event
          name: ticket.ticketName,
          description: '', // Add empty description for now
          price: parseFloat(ticket.price) || 0,
          capacity: parseInt(ticket.capacity) || null,
          ticket_type: ticket.ticketType.toLowerCase(),
          start_sale_date: new Date(ticket.startDate).toISOString(),
          end_sale_date: new Date(ticket.endDate).toISOString(),
          require_approval: ticket.requireApproval
        }));

        console.log('🎫 Ticket data to insert:', ticketData);

        const { data: savedTickets, error: ticketsError } = await supabase
          .from('tickets')
          .insert(ticketData)
          .select();

        if (ticketsError) {
          console.error('❌ Error creating tickets:', ticketsError);
          Alert.alert('Warning', 'Event created but failed to save tickets');
        } else {
          console.log('✅ Tickets created successfully:', savedTickets);
        }
      } else {
        console.log('ℹ️ No tickets to save (selectedOption:', selectedOption, ', tickets.length:', tickets.length, ')');
      }

      // Clear state and navigate to profile page automatically
      setTickets([]);
      setSelectedOption('RSVP');
      setRequireApproval(false);
      setAllowPlusOne(false);
      
      // Navigate to profile page automatically
      router.push('/(tabs)/profile');

    } catch (error) {
      console.error('Unexpected error creating event:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Back Button */}
      <View style={styles.backContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={20} name="chevron.left" color="#7B61FF" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <ThemedText style={styles.progressText}>Step 2 of 2</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Text Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.title}>How should people join your event?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Choose how attendees will access your event. Select RSVP for free events or Tickets for paid events.
          </ThemedText>
        </View>

        {/* Modern RSVP/Tickets Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedOption === 'RSVP' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
              onPress={() => setSelectedOption('RSVP')}
              activeOpacity={0.8}
            >
              <ThemedText style={[
                styles.toggleText,
                selectedOption === 'RSVP' ? styles.toggleTextActive : styles.toggleTextInactive
              ]}>
                RSVP
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedOption === 'Tickets' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
              onPress={() => setSelectedOption('Tickets')}
              activeOpacity={0.8}
            >
              <ThemedText style={[
                styles.toggleText,
                selectedOption === 'Tickets' ? styles.toggleTextActive : styles.toggleTextInactive
              ]}>
                Tickets
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ticket Container */}
        {selectedOption === 'Tickets' && (
          <View style={styles.ticketsSection}>
            {/* Tickets List Container */}
            <View style={styles.ticketsListContainer}>
              {/* Display existing tickets stacked vertically */}
              {tickets.map((ticket) => (
                <View key={ticket.id} style={styles.ticketCard}>
                  <View style={styles.ticketCardHeader}>
                    <View style={styles.ticketCardInfo}>
                      <ThemedText style={styles.ticketCardName}>{ticket.ticketName}</ThemedText>
                      <ThemedText style={styles.ticketCardType}>{ticket.ticketType}</ThemedText>
                    </View>
                    <View style={styles.ticketCardActions}>
                      <TouchableOpacity 
                        style={styles.ticketActionButton} 
                        onPress={() => handleEditTicket(ticket.id)}
                      >
                        <IconSymbol size={16} name="pencil" color="#7B3EFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.ticketActionButton} 
                        onPress={() => handleDeleteTicket(ticket.id)}
                      >
                        <IconSymbol size={16} name="trash" color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.ticketCardDetails}>
                    <View style={styles.ticketDetailRow}>
                      <ThemedText style={styles.ticketDetailLabel}>Price:</ThemedText>
                      <ThemedText style={styles.ticketDetailValue}>
                        {ticket.price === '0' || ticket.price === '' ? 'Free' : `$${ticket.price}`}
                      </ThemedText>
                    </View>
                    <View style={styles.ticketDetailRow}>
                      <ThemedText style={styles.ticketDetailLabel}>Capacity:</ThemedText>
                      <ThemedText style={styles.ticketDetailValue}>
                        {ticket.capacity || 'Unlimited'}
                      </ThemedText>
                    </View>
                    <View style={styles.ticketDetailRow}>
                      <ThemedText style={styles.ticketDetailLabel}>Sales Period:</ThemedText>
                      <ThemedText style={styles.ticketDetailValue}>
                        {new Date(ticket.startDate).toLocaleDateString()} - {new Date(ticket.endDate).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    {ticket.requireApproval && (
                      <View style={styles.ticketDetailRow}>
                        <ThemedText style={styles.ticketDetailLabel}>Requires Approval</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Modern Add Ticket Button */}
            <View style={styles.addTicketContainer}>
              <TouchableOpacity style={styles.addTicketButton} onPress={handleAddTicket} activeOpacity={0.8}>
                <IconSymbol size={20} name="plus.circle" color="#FFFFFF" />
                <ThemedText style={styles.addTicketText}>Add Ticket</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Modern Switches */}
        <View style={styles.switchesSection}>
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Require approval for guests</ThemedText>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: '#E0E0E0', true: '#7B3EFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Allow guests to bring +1</ThemedText>
            <Switch
              value={allowPlusOne}
              onValueChange={setAllowPlusOne}
              trackColor={{ false: '#E0E0E0', true: '#7B3EFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Modern Create Event Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.createButton, { opacity: isLoading ? 0.6 : 1 }]} 
          onPress={handleCreateEvent}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.createButtonText}>
            {isLoading ? 'Creating Event...' : 'Create Event'}
          </ThemedText>
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
  backContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#7B61FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#7B3EFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
    lineHeight: 22,
  },
  toggleSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#7B3EFF',
    shadowColor: '#7B3EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#1C1B1F',
  },
  ticketsSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketsListContainer: {
    marginBottom: 20,
  },
  ticketCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketCardInfo: {
    flex: 1,
  },
  ticketCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  ticketCardType: {
    fontSize: 14,
    color: '#7B3EFF',
    fontWeight: '600',
  },
  ticketCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  ticketCardDetails: {
    gap: 8,
  },
  ticketDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDetailLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  ticketDetailValue: {
    fontSize: 14,
    color: '#1C1B1F',
    fontWeight: '600',
  },
  addTicketContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTicketButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7B3EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addTicketText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchesSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B3EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});