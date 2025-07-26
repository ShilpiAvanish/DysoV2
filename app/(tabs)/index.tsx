
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  attendeeCount: number;
  imageUrl: string;
  tags: string[];
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'UT Austin Spring Mixer',
    date: 'Tonight, 9:00 PM',
    location: 'West Campus',
    price: 'Free',
    attendeeCount: 127,
    imageUrl: 'https://via.placeholder.com/300x400',
    tags: ['Party', 'College', 'Nightlife']
  },
  {
    id: '2',
    title: 'Rooftop Vibes',
    date: 'Saturday, 8:00 PM',
    location: 'Downtown Austin',
    price: '$15',
    attendeeCount: 89,
    imageUrl: 'https://via.placeholder.com/300x400',
    tags: ['Party', 'Rooftop', 'Music']
  },
  {
    id: '3',
    title: 'Study Break Social',
    date: 'Sunday, 7:00 PM',
    location: 'UT Campus',
    price: 'Free',
    attendeeCount: 64,
    imageUrl: 'https://via.placeholder.com/300x400',
    tags: ['Social', 'College', 'Casual']
  }
];

const filters = ['All', 'Tonight', 'This Weekend', 'Free', 'Trending'];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity style={[styles.eventCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <View style={styles.eventImage}>
        <ThemedText style={styles.placeholderText}>Event Flyer</ThemedText>
      </View>
      <View style={styles.eventInfo}>
        <ThemedText type="defaultSemiBold" style={styles.eventTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.eventDetails}>{item.date}</ThemedText>
        <ThemedText style={styles.eventDetails}>{item.location}</ThemedText>
        <View style={styles.eventMeta}>
          <ThemedText style={[styles.price, { color: Colors[colorScheme ?? 'light'].primary }]}>
            {item.price}
          </ThemedText>
          <ThemedText style={styles.attendees}>{item.attendeeCount} going</ThemedText>
        </View>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
              <ThemedText style={styles.tagText}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: Colors[colorScheme ?? 'light'].primary }]}>
          DYSO
        </ThemedText>
        <ThemedText style={styles.subtitle}>Discover Events</ThemedText>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Search events..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && { backgroundColor: Colors[colorScheme ?? 'light'].primary }
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedFilter === filter && { color: '#fff' }
              ]}
            >
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events Feed */}
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
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 12,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
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
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventImage: {
    height: 200,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    opacity: 0.5,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  eventDetails: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendees: {
    fontSize: 14,
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});
