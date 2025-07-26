import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

export default function CreateEventScreen() {
  const router = useRouter();
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const handleNext = () => {
    router.push('/event-join-settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Progress Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color="#1C1B1F" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Add Flyer</ThemedText>
        <TouchableOpacity>
          <ThemedText style={styles.skipButton}>Skip</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Flyer Upload Section */}
        <View style={styles.section}>
          <View style={styles.flyerUpload}>
            <View style={styles.flyerPlaceholder} />
          </View>

          <View style={styles.flyerInfo}>
            <ThemedText style={styles.flyerTitle}>Using default flyer</ThemedText>
            <ThemedText style={styles.flyerDescription}>
              Add an image to your event to make it stand out.
            </ThemedText>
            <ThemedText style={styles.recommendedSize}>
              Recommended size: 1080×1920px, JPG or PNG
            </ThemedText>
          </View>
        </View>

        {/* Event Info Section */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Event Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter event name"
              placeholderTextColor="#A0A0A0"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Event Date</ThemedText>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#A0A0A0"
                value={eventDate}
                onChangeText={setEventDate}
              />
              <TouchableOpacity style={styles.calendarIcon}>
                <IconSymbol size={20} name="calendar" color="#6750A4" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Location</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter venue address or city"
              placeholderTextColor="#A0A0A0"
              value={eventLocation}
              onChangeText={setEventLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell people about your event..."
              placeholderTextColor="#A0A0A0"
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <ThemedText style={styles.nextButtonText}>Next →</ThemedText>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  skipButton: {
    fontSize: 16,
    color: '#6750A4',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '25%',
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
  flyerUpload: {
    marginBottom: 16,
  },
  flyerPlaceholder: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6750A4',
    backgroundColor: '#F5F5F5',
  },
  flyerInfo: {
    marginTop: 16,
  },
  flyerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  flyerDescription: {
    fontSize: 14,
    color: '#1C1B1F',
    marginBottom: 4,
    lineHeight: 20,
  },
  recommendedSize: {
    fontSize: 14,
    color: '#6750A4',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D0C2FF',
    backgroundColor: '#FFFFFF',
    color: '#1C1B1F',
  },
  dateInputContainer: {
    position: 'relative',
  },
  dateInput: {
    paddingRight: 50,
  },
  calendarIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});