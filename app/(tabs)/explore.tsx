
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
  distance: string;
  attendees: number;
  category: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Mixer Downtown',
    date: 'Today, 7:00 PM',
    location: 'Austin Tech Hub',
    distance: '2.3 miles',
    attendees: 45,
    category: 'Networking'
  },
  {
    id: '2',
    title: 'Live Music Night',
    date: 'Tomorrow, 9:00 PM',
    location: 'The Saxon Pub',
    distance: '1.8 miles',
    attendees: 78,
    category: 'Music'
  },
  {
    id: '3',
    title: 'Food Truck Festival',
    date: 'Saturday, 12:00 PM',
    location: 'Zilker Park',
    distance: '3.1 miles',
    attendees: 234,
    category: 'Food'
  }
];

const categories = ['All', 'Party', 'Music', 'Food', 'Sports', 'Study', 'Networking'];

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity style={[styles.eventCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <View style={styles.eventImage}>
        <ThemedText style={styles.categoryTag}>{item.category}</ThemedText>
      </View>
      <View style={styles.eventDetails}>
        <ThemedText type="defaultSemiBold" style={styles.eventTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.eventMeta}>📅 {item.date}</ThemedText>
        <ThemedText style={styles.eventMeta}>📍 {item.location}</ThemedText>
        <View style={styles.eventFooter}>
          <ThemedText style={styles.distance}>{item.distance} away</ThemedText>
          <ThemedText style={styles.attendees}>{item.attendees} going</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: Colors[colorScheme ?? 'light'].primary }]}>
          Explore
        </ThemedText>
        <ThemedText style={styles.subtitle}>Find events near you</ThemedText>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Search events, venues, or hosts..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Location Filter */}
      <View style={styles.locationFilter}>
        <ThemedText style={styles.locationText}>📍 Austin, TX</ThemedText>
        <TouchableOpacity>
          <ThemedText style={[styles.changeLocation, { color: Colors[colorScheme ?? 'light'].primary }]}>
            Change
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && { backgroundColor: Colors[colorScheme ?? 'light'].primary }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <ThemedText
              style={[
                styles.categoryText,
                selectedCategory === category && { color: '#fff' }
              ]}
            >
              {category}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ThemedText style={styles.sortLabel}>Sort by:</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Distance', 'Trending', 'Tonight', 'Price'].map((sort) => (
            <TouchableOpacity key={sort} style={styles.sortButton}>
              <ThemedText style={styles.sortText}>{sort}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 12,
  },
  locationFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  changeLocation: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  eventImage: {
    height: 120,
    backgroundColor: '#e0e0e0',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 12,
  },
  categoryTag: {
    backgroundColor: 'rgba(99, 46, 209, 0.9)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  eventDetails: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  eventMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  distance: {
    fontSize: 12,
    opacity: 0.6,
  },
  attendees: {
    fontSize: 12,
    opacity: 0.6,
  },
});
