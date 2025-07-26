
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CreateEventScreen() {
  const colorScheme = useColorScheme();
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isTicketed, setIsTicketed] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowPlusOne, setAllowPlusOne] = useState(true);
  const [isPublic, setIsPublic] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: Colors[colorScheme ?? 'light'].primary }]}>
            Create Event
          </ThemedText>
        </View>

        {/* Add Flyer Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Add Flyer</ThemedText>
          <TouchableOpacity style={[styles.flyerUpload, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <ThemedText style={styles.uploadText}>📷 Upload Flyer</ThemedText>
            <ThemedText style={styles.uploadSubtext}>Suggested size: 1080×1920px</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Event Info Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Event Info</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Event Title</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].surface, color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Enter event title"
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
              value={eventTitle}
              onChangeText={setEventTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Date & Time</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].surface, color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Select date and time"
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
              value={eventDate}
              onChangeText={setEventDate}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Location</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].surface, color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Enter location"
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
              value={eventLocation}
              onChangeText={setEventLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: Colors[colorScheme ?? 'light'].surface, color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Tell people about your event..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Access Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Access Settings</ThemedText>
          
          <View style={styles.switchRow}>
            <View>
              <ThemedText style={styles.switchLabel}>Ticketed Event</ThemedText>
              <ThemedText style={styles.switchSubtext}>Charge for entry</ThemedText>
            </View>
            <Switch
              value={isTicketed}
              onValueChange={setIsTicketed}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].primary }}
              thumbColor={isTicketed ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <ThemedText style={styles.switchLabel}>Require Approval</ThemedText>
              <ThemedText style={styles.switchSubtext}>Review RSVPs before confirming</ThemedText>
            </View>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].primary }}
              thumbColor={requireApproval ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <View>
              <ThemedText style={styles.switchLabel}>Allow +1 Guests</ThemedText>
              <ThemedText style={styles.switchSubtext}>Let people bring a friend</ThemedText>
            </View>
            <Switch
              value={allowPlusOne}
              onValueChange={setAllowPlusOne}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].primary }}
              thumbColor={allowPlusOne ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Privacy Settings</ThemedText>
          
          <View style={styles.privacyButtons}>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                isPublic && { backgroundColor: Colors[colorScheme ?? 'light'].primary }
              ]}
              onPress={() => setIsPublic(true)}
            >
              <ThemedText style={[styles.privacyButtonText, isPublic && { color: '#fff' }]}>
                Public
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.privacyButton,
                !isPublic && { backgroundColor: Colors[colorScheme ?? 'light'].primary }
              ]}
              onPress={() => setIsPublic(false)}
            >
              <ThemedText style={[styles.privacyButtonText, !isPublic && { color: '#fff' }]}>
                UT Austin Only
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={[styles.createButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
          <ThemedText style={styles.createButtonText}>Create Event</ThemedText>
        </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  flyerUpload: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  privacyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  privacyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  privacyButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
