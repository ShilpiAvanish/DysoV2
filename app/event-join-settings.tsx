
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

export default function EventJoinSettingsScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('Tickets');
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowPlusOne, setAllowPlusOne] = useState(false);

  const handleAddTicket = () => {
    router.push('/add-ticket');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={20} name="chevron.left" color="#007AFF" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={styles.section}>
          <ThemedText style={styles.title}>How should people join your event?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Choose how attendees will access your event. Select RSVP for free events or Tickets for paid events.
          </ThemedText>
        </View>

        {/* Selection Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.leftToggle,
                selectedOption === 'RSVP' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
              onPress={() => setSelectedOption('RSVP')}
            >
              <ThemedText style={[
                styles.toggleText,
                selectedOption === 'RSVP' ? styles.toggleTextActive : styles.toggleTextInactive
              ]}>
                RSVP
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.rightToggle,
                selectedOption === 'Tickets' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
              onPress={() => setSelectedOption('Tickets')}
            >
              <ThemedText style={[
                styles.toggleText,
                selectedOption === 'Tickets' ? styles.toggleTextActive : styles.toggleTextInactive
              ]}>
                Tickets
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ticket Container */}
        {selectedOption === 'Tickets' && (
          <View style={styles.section}>
            <View style={styles.ticketContainer}>
              <TouchableOpacity style={styles.addTicketButton} onPress={handleAddTicket}>
                <ThemedText style={styles.addTicketText}>Add Ticket +</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Toggle Switches */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Require approval for guests</ThemedText>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: '#E0E0E0', true: '#7B3EFF' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Allow guests to bring +1</ThemedText>
            <Switch
              value={allowPlusOne}
              onValueChange={setAllowPlusOne}
              trackColor={{ false: '#E0E0E0', true: '#7B3EFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Create Event Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton}>
          <ThemedText style={styles.continueButtonText}>Create Event</ThemedText>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '50%',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 50,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftToggle: {
    borderTopLeftRadius: 46,
    borderBottomLeftRadius: 46,
  },
  rightToggle: {
    borderTopRightRadius: 46,
    borderBottomRightRadius: 46,
  },
  toggleButtonActive: {
    backgroundColor: '#7B3EFF',
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#1C1B1F',
  },
  ticketContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  addTicketButton: {
    backgroundColor: '#888888',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addTicketText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
