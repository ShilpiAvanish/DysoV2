
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TicketsScreen() {
  const [activeTab, setActiveTab] = useState('My Tickets');

  const tabs = ['My Tickets', 'Past Events'];

  const mockTickets = [
    {
      id: '1',
      eventName: 'College Party',
      date: 'Fri, Oct 27, 9 PM',
      location: '123 Main St',
      ticketType: 'General Admission',
      price: 'Free',
    },
    {
      id: '2',
      eventName: 'Study Group Meetup',
      date: 'Sat, Oct 28, 2 PM',
      location: 'Campus Library',
      ticketType: 'Reserved Seat',
      price: '$5.00',
    },
  ];

  const pastTickets = [
    {
      id: '3',
      eventName: 'Welcome Week Party',
      date: 'Thu, Sep 15, 8 PM',
      location: 'Student Center',
      ticketType: 'General Admission',
      price: 'Free',
    },
  ];

  const currentTickets = activeTab === 'My Tickets' ? mockTickets : pastTickets;

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
                <TouchableOpacity key={ticket.id} style={styles.ticketCard}>
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
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ticketContent: {
    flex: 1,
    marginRight: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1B1F',
    flex: 1,
    marginRight: 8,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600',
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
    flex: 1,
  },
  qrCodePlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
