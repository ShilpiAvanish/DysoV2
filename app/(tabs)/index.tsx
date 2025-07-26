import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendance: string;
  imageColor: string;
  imageContent: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Cosmic Carnival',
    date: 'Sat, Oct 26 · 9 PM',
    location: 'The Venue',
    attendance: '100+ attending',
    imageColor: '#1a1a2e',
    imageContent: 'Party\nCarnival'
  },
  {
    id: '2',
    title: 'Silent Disco',
    date: 'Fri, Oct 25 · 10 PM',
    location: 'Secret Location',
    attendance: '50+ attending',
    imageColor: '#e91e63',
    imageContent: '🎧'
  },
  {
    id: '3',
    title: 'Glow Rave',
    date: 'Sat, Oct 26 · 11 PM',
    location: 'Warehouse District',
    attendance: '200+ attending',
    imageColor: '#0a0a0a',
    imageContent: '✦'
  },
  {
    id: '4',
    title: 'Indie Rock Night',
    date: 'Fri, Oct 25 · 8 PM',
    location: 'The Dive Bar',
    attendance: '75+ attending',
    imageColor: '#8bc34a',
    imageContent: '🎸'
  }
];

const filters = ['Distance', 'Trending', 'Tonight'];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [selectedFilter, setSelectedFilter] = useState('Distance');

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={[styles.eventImage, { backgroundColor: item.imageColor }]}>
        <ThemedText style={styles.eventImageText}>{item.imageContent}</ThemedText>
      </View>
      <View style={styles.eventInfo}>
        <ThemedText type="defaultSemiBold" style={styles.eventTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.eventDetails}>{item.date} · {item.location}</ThemedText>
        <ThemedText style={styles.eventAttendance}>{item.attendance}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <IconSymbol size={24} name="location" color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Events</ThemedText>
        <TouchableOpacity style={styles.headerIcon}>
          <IconSymbol size={24} name="slider.horizontal.3" color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonSelected
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <View style={styles.filterContent}>
              <IconSymbol size={16} name="location" color={selectedFilter === filter ? "#6750a4" : "#888"} />
              {filter === 'Trending' && <IconSymbol size={16} name="chart.line.uptrend.xyaxis" color={selectedFilter === filter ? "#6750a4" : "#888"} />}
              {filter === 'Tonight' && <IconSymbol size={16} name="moon" color={selectedFilter === filter ? "#6750a4" : "#888"} />}
              <ThemedText
                style={[
                  styles.filterText,
                  { color: selectedFilter === filter ? "#6750a4" : "#888" }
                ]}
              >
                {filter}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <FlatList
        data={mockEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonSelected: {
    backgroundColor: '#e8def8',
    borderColor: '#6750a4',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventImageText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  eventDetails: {
    fontSize: 14,
    color: '#6750a4',
    marginBottom: 4,
    fontWeight: '400',
  },
  eventAttendance: {
    fontSize: 12,
    color: '#6750a4',
    fontWeight: '400',
  },
});