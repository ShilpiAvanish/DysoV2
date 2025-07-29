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

  const handleAddTicket = () => {
    router.push('/add-ticket');
  };

  const handleEditTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      router.push({
        pathname: '/add-ticket',
        params: {
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
          const ticketData = JSON.parse(params.newTicket as string);
          if (params.editTicketId) {
            // Update existing ticket
            setTickets(prev => prev.map(ticket => 
              ticket.id === params.editTicketId ? { ...ticketData, id: params.editTicketId } : ticket
            ));
          } else {
            // Add new ticket
            setTickets(prev => [...prev, { ...ticketData, id: Date.now().toString() }]);
          }
          // Clear the params
          router.setParams({ newTicket: undefined, editTicketId: undefined });
        } catch (error) {
          console.error('Error parsing ticket data:', error);
        }
      }
    }, [params.newTicket, params.editTicketId])
  );

  const convertDateToTimestamp = (dateString: string) => {
    // Convert MM/DD/YYYY to ISO timestamp
    const [month, day, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // Set time to 8 PM as default
    date.setHours(20, 0, 0, 0);
    return date.toISOString();
  };

  const handleCreateEvent = async () => {
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to create an event');
        return;
      }

      // Prepare event data
      const eventData = {
        title: params.eventTitle as string,
        description: params.eventDescription as string,
        host_id: user.id,
        date_time: convertDateToTimestamp(params.eventDate as string),
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

      // If tickets were added, save them to the database
      if (selectedOption === 'Tickets' && tickets.length > 0) {
        const ticketData = tickets.map(ticket => ({
          event_id: newEvent.id,
          name: ticket.ticketName,
          price: parseFloat(ticket.price) || 0,
          capacity: parseInt(ticket.capacity) || null,
          ticket_type: ticket.ticketType.toLowerCase(),
          start_sale_date: new Date(ticket.startDate).toISOString(),
          end_sale_date: new Date(ticket.endDate).toISOString(),
          require_approval: ticket.requireApproval
        }));

        const { error: ticketsError } = await supabase
          .from('tickets')
          .insert(ticketData);

        if (ticketsError) {
          console.error('Error creating tickets:', ticketsError);
          Alert.alert('Warning', 'Event created but failed to save tickets');
        } else {
          console.log('Tickets created successfully');
        }
      }

      Alert.alert('Success', 'Event created successfully!', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)/profile')
        }
      ]);

    } catch (error) {
      console.error('Unexpected error creating event:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={20} name="chevron.left" color="#007AFF" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={styles.section}>
          <ThemedText style={styles.title}>How should people join your event?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Choose how attendees will access your event. Select RSVP for free events or Tickets for paid events.
          </ThemedText>
        </View>

        {/* Selection Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.leftToggle,
                selectedOption === 'RSVP' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
              onPress={() => setSelectedOption('RSVP')}
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
                styles.rightToggle,
                selectedOption === 'Tickets' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
              onPress={() => setSelectedOption('Tickets')}
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
          <View style={styles.section}>
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

            {/* Add Ticket Button - always at the bottom */}
            <View style={styles.ticketContainer}>
              <TouchableOpacity style={styles.addTicketButton} onPress={handleAddTicket}>
                <ThemedText style={styles.addTicketText}>Add Ticket +</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Toggle Switches */}
        <View style={styles.section}>
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

      {/* Create Event Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, { opacity: isLoading ? 0.6 : 1 }]} 
          onPress={handleCreateEvent}
          disabled={isLoading}
        >
          <ThemedText style={styles.continueButtonText}>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '50%',
    backgroundColor: '#9F59FF',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftToggle: {
    borderTopLeftRadius: 46,
    borderBottomLeftRadius: 46,
  },
  rightToggle: {
    borderTopRightRadius: 46,
    borderBottomRightRadius: 46,
  },
  toggleButtonActive: {
    backgroundColor: '#7B3EFF',
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#1C1B1F',
  },
  ticketsListContainer: {
    marginBottom: 16,
  },
  ticketContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  addTicketButton: {
    backgroundColor: '#888888',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addTicketText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: 'bold',
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
    backgroundColor: '#F5F5F5',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});