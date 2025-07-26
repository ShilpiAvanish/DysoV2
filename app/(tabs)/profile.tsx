
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Event {
  id: string;
  title: string;
  date: string;
  attendees: number;
}

const mockEvents: Event[] = [
  { id: '1', title: 'Spring Mixer', date: 'Mar 15', attendees: 127 },
  { id: '2', title: 'Rooftop Vibes', date: 'Mar 20', attendees: 89 },
  { id: '3', title: 'Study Break', date: 'Mar 25', attendees: 64 },
];

const tabs = ['Attending', 'Saved', 'Hosting', 'Hosted'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState('Attending');

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity style={[styles.eventItem, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <View style={styles.eventThumbnail}>
        <ThemedText style={styles.eventThumbnailText}>📷</ThemedText>
      </View>
      <View style={styles.eventInfo}>
        <ThemedText type="defaultSemiBold" style={styles.eventTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.eventDate}>{item.date}</ThemedText>
        <ThemedText style={styles.eventAttendees}>{item.attendees} attendees</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profilePicture}>
            <ThemedText style={styles.profileEmoji}>👤</ThemedText>
          </View>
          <ThemedText type="title" style={styles.profileName}>Alex Johnson</ThemedText>
          <ThemedText style={styles.profileHandle}>@alexjohnson</ThemedText>
          <ThemedText style={styles.profileUniversity}>University of Texas at Austin</ThemedText>
          <ThemedText style={styles.profileBio}>
            Senior studying Business 📚 Event enthusiast 🎉 Love connecting people!
          </ThemedText>
          
          <TouchableOpacity style={[styles.editButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>24</ThemedText>
            <ThemedText style={styles.statLabel}>Events Attended</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>8</ThemedText>
            <ThemedText style={styles.statLabel}>Events Hosted</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>156</ThemedText>
            <ThemedText style={styles.statLabel}>Friends</ThemedText>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: Colors[colorScheme ?? 'light'].primary }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === tab && { color: '#fff' }
                ]}
              >
                {tab}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          <FlatList
            data={mockEvents}
            renderItem={renderEventItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileEmoji: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  profileUniversity: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
    backgroundColor: '#f0f0f0',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventThumbnailText: {
    fontSize: 20,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  eventAttendees: {
    fontSize: 12,
    opacity: 0.6,
  },
});
