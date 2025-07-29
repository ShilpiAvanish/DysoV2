import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';

export default function SetupProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [campus, setCampus] = useState('UT Austin'); // Set default campus to UT Austin
  const [isLoading, setIsLoading] = useState(false); // Loading state



  const handleUpload = () => {
    // Handle photo upload
    console.log('Upload photo');
  };

  const handleTakePhoto = () => {
    // Handle take photo
    console.log('Take photo');
  };

  const testButtonPress = () => {
    console.log('🔘 Button pressed!');
    Alert.alert('Test', 'Button is working!');
  };

  const handleComplete = async () => {
    console.log('=== handleComplete called ===');
    console.log('Form data:', { username, name, birthday, campus, selectedGender });
    
    // Validate required fields
    if (!username.trim()) {
      console.log('❌ Username validation failed');
      Alert.alert('Error', 'Username is required');
      return;
    }
    console.log('✅ Username validation passed');

    if (!name.trim()) {
      console.log('❌ Name validation failed');
      Alert.alert('Error', 'Name is required');
      return;
    }
    console.log('✅ Name validation passed');

    if (!birthday.trim()) {
      console.log('❌ Birthday validation failed');
      Alert.alert('Error', 'Birthday is required');
      return;
    }
    console.log('✅ Birthday validation passed');

    if (!campus.trim()) {
      console.log('❌ Campus validation failed');
      Alert.alert('Error', 'Campus is required');
      return;
    }
    console.log('✅ Campus validation passed');

    // Basic birthday format validation (MM/DD/YYYY)
    const birthdayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    console.log('Birthday format test:', birthdayRegex.test(birthday), 'for birthday:', birthday);
    if (!birthdayRegex.test(birthday)) {
      console.log('❌ Birthday format validation failed');
      Alert.alert('Error', 'Please enter birthday in MM/DD/YYYY format');
      return;
    }
    console.log('✅ Birthday format validation passed');

    console.log('🚀 Starting Supabase operations...');
    setIsLoading(true);

    try {
      // Get current user
      console.log('🔍 Getting current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log('❌ User authentication failed:', userError);
        Alert.alert('Error', 'You must be logged in to complete your profile');
        return;
      }
      console.log('✅ User authentication successful:', user.id);

      // Convert birthday from MM/DD/YYYY to YYYY-MM-DD for database
      const [month, day, year] = birthday.split('/');
      const formattedBirthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Prepare profile data
      const profileData = {
        id: user.id,
        username: username.trim(),
        full_name: name.trim(),
        bio: bio.trim() || null,
        birthday: formattedBirthday,
        gender: selectedGender.toLowerCase() || null,
        university: campus.trim(),
        phone_number: user.phone || null,
      };

      console.log('💾 Saving profile data:', profileData);
      
      // Insert or update profile
      console.log('📤 Sending to Supabase...');
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('❌ Error saving profile:', profileError);
        Alert.alert('Error', 'Failed to save profile. Please try again.');
        return;
      }
      console.log('✅ Profile saved successfully!');

      console.log('🎉 Profile setup complete - navigating directly');
      
      // Navigate directly to the EventsList (Home tab) without showing alert
      console.log('🚀 Navigating to EventsList...');
      
      // Try navigating to the tabs with replace
      router.replace('/(tabs)');
      
      // Add a fallback to check if navigation worked
      setTimeout(() => {
        console.log('🔄 Checking if navigation worked...');
        console.log('Current route:', router.canGoBack());
      }, 1000);
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      console.log('🏁 handleComplete finished, setting loading to false');
      setIsLoading(false);
    }
  };

  const genderOptions = ['Male', 'Female', 'Other'];

  // Check if all required fields are filled
  const birthdayRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  const isFormValid = username.trim() && name.trim() && birthday.trim() && campus.trim() && birthdayRegex.test(birthday);
  
  // Debug form validation (only log when form becomes valid)
  if (isFormValid) {
    console.log('✅ Form is now valid and ready to submit');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol size={20} name="chevron.left" color="#007AFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Set up profile</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Image Section */}
          <View style={styles.profileImageSection}>
            <View style={styles.avatarPlaceholder}>
              <View style={styles.avatarIcon}>
                <IconSymbol size={40} name="person.fill" color="#000000" />
              </View>
            </View>
            <View style={styles.photoButtonsContainer}>
              {/* Remove Upload/Take Photo buttons */}
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#A0A0A0"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#A0A0A0"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram Handle</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your handle"
                placeholderTextColor="#A0A0A0"
                value={instagramHandle}
                onChangeText={setInstagramHandle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder=""
                placeholderTextColor="#A0A0A0"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Gender Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {genderOptions.map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      selectedGender === gender ? styles.genderButtonActive : styles.genderButtonInactive
                    ]}
                    onPress={() => setSelectedGender(gender)}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        selectedGender === gender ? styles.genderButtonTextActive : styles.genderButtonTextInactive
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Birthday */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birthday</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#A0A0A0"
                  value={birthday}
                  onChangeText={setBirthday}
                />
                <TouchableOpacity style={styles.calendarIcon}>
                  <IconSymbol size={20} name="calendar" color="#7B3EFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Must be 18 or older to use this app</Text>
            </View>

            {/* Campus */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus</Text>
              <TextInput
                style={styles.input}
                value="UT Austin"
                editable={false} // Make it non-editable
              />
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Complete Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[styles.completeButton, { opacity: (isFormValid && !isLoading) ? 1 : 0.6 }]} 
          onPress={handleComplete} 
          disabled={!isFormValid || isLoading}
        >
          <Text style={styles.completeButtonText}>{isLoading ? "Saving..." : "Complete →"}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  scrollView: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  avatarIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    borderWidth: 1,
    borderColor: '#7B3EFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B3EFF',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0C2FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1C1B1F',
    backgroundColor: '#FFFFFF',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  genderButtonActive: {
    backgroundColor: '#7B3EFF',
    borderColor: '#7B3EFF',
  },
  genderButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: '#7B3EFF',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  genderButtonTextInactive: {
    color: '#7B3EFF',
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
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownInput: {
    paddingRight: 50,
  },
  dropdownIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    transform: [{ rotate: '90deg' }],
  },
  helpText: {
    fontSize: 12,
    color: '#7B3EFF',
    marginTop: 4,
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  completeButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});