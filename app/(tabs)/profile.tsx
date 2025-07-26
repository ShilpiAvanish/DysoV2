import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const tabs = ['Attending', 'Saved', 'Hosting', 'Hosted'];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState('Attending');

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <ThemedText style={styles.profileEmoji}>👤</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.profileName}>Alex Johnson</ThemedText>
          <ThemedText style={styles.profileHandle}>@alexjohnson</ThemedText>
          <ThemedText style={styles.profileUniversity}>University of Texas at Austin</ThemedText>
          <ThemedText style={styles.profileBio}>
            Senior studying Business 📚 Event enthusiast 🎉 Love connecting people!
          </ThemedText>

          <TouchableOpacity style={styles.editButton}>
            <ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
          </TouchableOpacity>
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

        {/* Empty State */}
        <View style={styles.emptyStateContainer}>
          <View style={styles.placeholderImage}>
            <ThemedText style={styles.placeholderImageText}>📷</ThemedText>
          </View>
          <ThemedText style={styles.noEventsText}>No events yet</ThemedText>
          <ThemedText style={styles.supportText}>
            You haven't joined any events yet. Explore events and join the fun!
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6FF',
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
  profilePictureContainer: {
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  profileEmoji: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileUniversity: {
    fontSize: 16,
    color: '#6750A4',
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  profileBio: {
    fontSize: 15,
    textAlign: 'center',
    color: '#4A4A4A',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  editButton: {
    backgroundColor: '#f0eefc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    color: '#1C1B1F',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: '#6750A4',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1C1B1F',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E8E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderImageText: {
    fontSize: 40,
    opacity: 0.6,
  },
  noEventsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 15,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },
});