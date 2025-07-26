
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput, SafeAreaView, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

export default function AddTicketScreen() {
  const router = useRouter();
  const [selectedTicketType, setSelectedTicketType] = useState('Custom');
  const [ticketName, setTicketName] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [startDate, setStartDate] = useState('Jul 26, 2025 at 1:21 PM');
  const [endDate, setEndDate] = useState('Jul 27, 2025 at 1:21 PM');
  const [requireApproval, setRequireApproval] = useState(false);

  const ticketTypes = ['Custom', 'Presale', 'Door'];

  const handleSave = () => {
    // Handle save logic here
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={20} name="chevron.left" color="#007AFF" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Add Ticket</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={styles.section}>
          <ThemedText style={styles.title}>Add Ticket</ThemedText>
        </View>

        {/* Ticket Type Toggle */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Ticket Type</ThemedText>
          <View style={styles.toggleContainer}>
            {ticketTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleButton,
                  selectedTicketType === type ? styles.toggleButtonActive : styles.toggleButtonInactive
                ]}
                onPress={() => setSelectedTicketType(type)}
              >
                <ThemedText
                  style={[
                    styles.toggleText,
                    selectedTicketType === type ? styles.toggleTextActive : styles.toggleTextInactive
                  ]}
                >
                  {type}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ticket Configuration Fields */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Ticket Name</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter ticket name"
              placeholderTextColor="#A0A0A0"
              value={ticketName}
              onChangeText={setTicketName}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Price</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#A0A0A0"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Capacity</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="100"
              placeholderTextColor="#A0A0A0"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ticket Availability Section */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>Ticket Availability</ThemedText>
          
          <TouchableOpacity style={styles.dateTimeField}>
            <View style={styles.dateTimeContent}>
              <ThemedText style={styles.dateTimeLabel}>Start Date & Time</ThemedText>
              <ThemedText style={styles.dateTimeValue}>{startDate}</ThemedText>
            </View>
            <IconSymbol size={20} name="calendar" color="#7B3EFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateTimeField}>
            <View style={styles.dateTimeContent}>
              <ThemedText style={styles.dateTimeLabel}>End Date & Time</ThemedText>
              <ThemedText style={styles.dateTimeValue}>{endDate}</ThemedText>
            </View>
            <IconSymbol size={20} name="calendar" color="#7B3EFF" />
          </TouchableOpacity>
        </View>

        {/* Approval Toggle */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <ThemedText style={styles.switchLabel}>Require approval for this ticket</ThemedText>
            <Switch
              value={requireApproval}
              onValueChange={setRequireApproval}
              trackColor={{ false: '#E0E0E0', true: '#7B3EFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1B1F',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
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
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: '#D0C2FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1B1F',
    backgroundColor: '#FFFFFF',
  },
  dateTimeField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#D0C2FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '500',
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
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
