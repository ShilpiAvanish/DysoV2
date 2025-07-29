import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput, SafeAreaView, Alert } from 'react-native';
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
  const [flyerUploaded, setFlyerUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    // Validate required fields
    if (!eventTitle.trim()) {
      Alert.alert('Required Field', 'Event name is required');
      return;
    }
    if (!eventDate.trim()) {
      Alert.alert('Required Field', 'Event date is required');
      return;
    }
    if (!eventLocation.trim()) {
      Alert.alert('Required Field', 'Location is required');
      return;
    }
    if (!eventDescription.trim()) {
      Alert.alert('Required Field', 'Description is required');
      return;
    }

    setIsLoading(true);

    // Pass event data to next screen
    const eventParams = {
      eventTitle,
      eventDate,
      eventLocation,
      eventDescription
    };
    
    console.log('🎯 Create page passing params:', eventParams);
    
    router.push({
      pathname: '/event-join-settings',
      params: eventParams
    });
  };

  const handleFlyerUpload = () => {
    // Simulate flyer upload
    setFlyerUploaded(true);
    Alert.alert('Success', 'Flyer uploaded successfully!');
  };

  const isFormValid = eventTitle.trim() && eventDate.trim() && eventLocation.trim() && eventDescription.trim();

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={24} name="chevron.left" color="#1C1B1F" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Create Event</ThemedText>
        <TouchableOpacity style={styles.skipButton}>
          <ThemedText style={styles.skipButtonText}>Skip →</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <ThemedText style={styles.progressText}>Step 1 of 2</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Modern Flyer Upload Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Event Flyer</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Add an image to make your event stand out
          </ThemedText>
          
          <TouchableOpacity 
            style={[styles.flyerUpload, flyerUploaded && styles.flyerUploaded]} 
            onPress={handleFlyerUpload}
            activeOpacity={0.7}
          >
            {flyerUploaded ? (
              <View style={styles.flyerPreview}>
                <View style={styles.flyerThumbnail} />
                <View style={styles.flyerOverlay}>
                  <IconSymbol size={32} name="checkmark.circle.fill" color="#4CAF50" />
                  <ThemedText style={styles.flyerSuccessText}>Flyer Uploaded</ThemedText>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.uploadIconContainer}>
                  <IconSymbol size={48} name="arrow.up.circle" color="#6750A4" />
                </View>
                <ThemedText style={styles.uploadText}>Upload Flyer</ThemedText>
                <ThemedText style={styles.uploadSubtext}>
                  Tap to select an image
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.flyerInfo}>
            <ThemedText style={styles.recommendedSize}>
              Recommended: 1080×1920px, JPG or PNG
            </ThemedText>
          </View>
        </View>

        {/* Event Info Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Event Details</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Event Name *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your event name"
              placeholderTextColor="#999999"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Event Date *</ThemedText>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor="#999999"
                value={eventDate}
                onChangeText={setEventDate}
              />
              <TouchableOpacity style={styles.calendarIcon}>
                <IconSymbol size={20} name="calendar" color="#6750A4" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Location *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter venue address or city"
              placeholderTextColor="#999999"
              value={eventLocation}
              onChangeText={setEventLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Description *</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell people about your event..."
              placeholderTextColor="#999999"
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Modern Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.nextButton, 
            !isFormValid && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          disabled={!isFormValid || isLoading}
          activeOpacity={0.8}
        >
          <ThemedText style={[
            styles.nextButtonText,
            !isFormValid && styles.nextButtonTextDisabled
          ]}>
            {isLoading ? 'Processing...' : 'Next →'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    width: '50%',
    backgroundColor: '#6750A4',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '400',
    marginBottom: 20,
    lineHeight: 22,
  },
  flyerUpload: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  flyerUploaded: {
    borderColor: '#4CAF50',
    borderStyle: 'solid',
    backgroundColor: '#F8FFF8',
  },
  uploadIconContainer: {
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6750A4',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '400',
  },
  flyerPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  flyerThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  flyerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flyerSuccessText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 8,
  },
  flyerInfo: {
    alignItems: 'center',
  },
  recommendedSize: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '400',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    color: '#1C1B1F',
    fontWeight: '400',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateInputContainer: {
    position: 'relative',
  },
  dateInput: {
    paddingRight: 60,
  },
  calendarIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
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
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#6750A4',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6750A4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
});