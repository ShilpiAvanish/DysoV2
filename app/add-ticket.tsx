
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput, SafeAreaView, Switch, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddTicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  console.log('🎫 AddTicketScreen received params:', params);
  const [selectedTicketType, setSelectedTicketType] = useState('Custom');
  const [ticketName, setTicketName] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!params.editTicketId;

  // Load ticket data if editing
  useEffect(() => {
    if (isEditing && params.ticketType) {
      setSelectedTicketType(params.ticketType as string);
      setTicketName(params.ticketName as string || '');
      setPrice(params.price as string || '');
      setCapacity(params.capacity as string || '');
      setStartDate(params.startDate as string || '');
      setEndDate(params.endDate as string || '');
      setRequireApproval(params.requireApproval === 'true');
    }
  }, [params]);

  const ticketTypes = ['Custom', 'Presale', 'Door'];

  const handleSave = () => {
    // Validate required fields
    if (!ticketName.trim()) {
      Alert.alert('Required Field', 'Ticket name is required');
      return;
    }

    if (!price.trim()) {
      Alert.alert('Required Field', 'Price is required');
      return;
    }

    if (!capacity.trim()) {
      Alert.alert('Required Field', 'Capacity is required');
      return;
    }

    if (!startDate.trim()) {
      Alert.alert('Required Field', 'Start date is required');
      return;
    }

    if (!endDate.trim()) {
      Alert.alert('Required Field', 'End date is required');
      return;
    }

    setIsLoading(true);

    // Prepare ticket data
    const ticketData = {
      ticketType: selectedTicketType,
      ticketName: ticketName.trim(),
      price: price.trim(),
      capacity: capacity.trim(),
      startDate,
      endDate,
      requireApproval
    };

    // Navigate back with ticket data and preserve original event parameters
    const eventParams: any = {};
    
    // Only add event parameters if they exist and are not undefined
    if (params.eventTitle && params.eventTitle !== 'undefined') {
      eventParams.eventTitle = params.eventTitle;
    }
    if (params.eventDate && params.eventDate !== 'undefined') {
      eventParams.eventDate = params.eventDate;
    }
    if (params.eventLocation && params.eventLocation !== 'undefined') {
      eventParams.eventLocation = params.eventLocation;
    }
    if (params.eventDescription && params.eventDescription !== 'undefined') {
      eventParams.eventDescription = params.eventDescription;
    }
    
    console.log('🎫 Preserving event params:', eventParams);
    
    router.push({
      pathname: '/event-join-settings',
      params: {
        ...eventParams,
        // Add ticket data
        newTicket: JSON.stringify(ticketData),
        editTicketId: isEditing ? params.editTicketId : undefined
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Back Button */}
      <View style={styles.backContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={20} name="chevron.left" color="#7B61FF" />
          <ThemedText style={styles.backText}>Back</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section Header */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.title}>
            {isEditing ? 'Edit Ticket' : 'Add Ticket'}
          </ThemedText>
        </View>

        {/* Modern Ticket Type Toggle */}
        <View style={styles.toggleSection}>
          <ThemedText style={styles.sectionLabel}>Ticket Type</ThemedText>
          <View style={styles.toggleContainer}>
            {ticketTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleButton,
                  selectedTicketType === type ? styles.toggleButtonActive : styles.toggleButtonInactive
                ]}
                onPress={() => setSelectedTicketType(type)}
                activeOpacity={0.8}
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
        <View style={styles.inputSection}>
          <ThemedText style={styles.sectionLabel}>Ticket Details</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Ticket Name *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="e.g., Early Bird"
              placeholderTextColor="#999999"
              value={ticketName}
              onChangeText={setTicketName}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Price *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="$10.00"
              placeholderTextColor="#999999"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Capacity *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="100"
              placeholderTextColor="#999999"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Ticket Availability Section */}
        <View style={styles.availabilitySection}>
          <ThemedText style={styles.sectionLabel}>Ticket Availability</ThemedText>
          
          <View style={styles.dateTimeField}>
            <View style={styles.dateTimeContent}>
              <ThemedText style={styles.dateTimeLabel}>Start Date & Time *</ThemedText>
              <TextInput
                style={styles.dateTimeInput}
                placeholder="MM/DD/YYYY HH:MM AM/PM"
                placeholderTextColor="#999999"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <IconSymbol size={20} name="calendar" color="#7B3EFF" />
          </View>

          <View style={styles.dateTimeField}>
            <View style={styles.dateTimeContent}>
              <ThemedText style={styles.dateTimeLabel}>End Date & Time *</ThemedText>
              <TextInput
                style={styles.dateTimeInput}
                placeholder="MM/DD/YYYY HH:MM AM/PM"
                placeholderTextColor="#999999"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
            <IconSymbol size={20} name="calendar" color="#7B3EFF" />
          </View>
        </View>

        {/* Approval Toggle */}
        <View style={styles.approvalSection}>
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

      {/* Modern Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, { opacity: isLoading ? 0.6 : 1 }]} 
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Ticket'}
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
  backContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#7B61FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  toggleSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 999,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#7B3EFF',
    shadowColor: '#7B3EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#1C1B1F',
  },
  inputSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1C1B1F',
    backgroundColor: '#FFFFFF',
    fontWeight: '400',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  availabilitySection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateTimeField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  dateTimeInput: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '400',
    paddingVertical: 0,
  },
  approvalSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1C1B1F',
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B3EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
