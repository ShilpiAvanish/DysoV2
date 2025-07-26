
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  university: string;
  mutualFriends: number;
}

const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: '@sarahj',
    avatar: '👩🏽',
    university: 'UT Austin',
    mutualFriends: 12,
  },
  {
    id: '2',
    name: 'Mike Chen',
    username: '@mikechen',
    avatar: '👨🏻',
    university: 'UT Austin',
    mutualFriends: 8,
  },
  {
    id: '3',
    name: 'Alex Rivera',
    username: '@alexr',
    avatar: '👨🏽',
    university: 'UT Austin',
    mutualFriends: 15,
  },
];

const tabs = ['Friends', 'Discover', 'Requests'];

export default function FriendsScreen() {
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState('Friends');

  const renderFriendCard = ({ item }: { item: Friend }) => (
    <View style={[styles.friendCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <View style={styles.friendInfo}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarEmoji}>{item.avatar}</ThemedText>
        </View>
        <View style={styles.friendDetails}>
          <ThemedText type="defaultSemiBold" style={styles.friendName}>{item.name}</ThemedText>
          <ThemedText style={styles.friendUsername}>{item.username}</ThemedText>
          <ThemedText style={styles.friendMeta}>{item.university}</ThemedText>
          <ThemedText style={styles.mutualFriends}>{item.mutualFriends} mutual friends</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
        <ThemedText style={styles.actionButtonText}>
          {activeTab === 'Friends' ? 'Message' : activeTab === 'Requests' ? 'Accept' : 'Add'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={[styles.title, { color: Colors[colorScheme ?? 'light'].primary }]}>
          Friends
        </ThemedText>
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

      {/* Friends List */}
      <FlatList
        data={mockFriends}
        renderItem={renderFriendCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.friendsList}
      />

      {/* Add Friends Button */}
      {activeTab === 'Friends' && (
        <TouchableOpacity style={[styles.addFriendsButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
          <ThemedText style={styles.addFriendsButtonText}>+ Add Friends</ThemedText>
        </TouchableOpacity>
      )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendsList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  friendMeta: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  addFriendsButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  addFriendsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
