import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload your profile photo.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    setIsUploadingImage(true);
    
    // Add a timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout reached, resetting loading state');
      setIsUploadingImage(false);
    }, 30000); // 30 second timeout
    
    try {
      console.log('📱 Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📱 Image picker result:', result);
      console.log('📱 Result canceled:', result.canceled);
      console.log('📱 Result assets:', result.assets);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('✅ Selected image:', selectedImage.uri);
        setProfileImage(selectedImage.uri);
      } else {
        console.log('❌ No image selected or picker was canceled');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      console.log('🏁 Setting isUploadingImage to false');
      clearTimeout(timeoutId);
      setIsUploadingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take a photo.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsUploadingImage(true);
    
    // Add a timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout reached, resetting loading state');
      setIsUploadingImage(false);
    }, 30000); // 30 second timeout
    
    try {
      console.log('📸 Opening camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📸 Camera result:', result);
      console.log('📸 Result canceled:', result.canceled);
      console.log('📸 Result assets:', result.assets);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedImage = result.assets[0];
        console.log('✅ Captured image:', capturedImage.uri);
        setProfileImage(capturedImage.uri);
      } else {
        console.log('❌ No photo captured or camera was canceled');
      }
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      console.log('🏁 Setting isUploadingImage to false');
      clearTimeout(timeoutId);
      setIsUploadingImage(false);
    }
  };

  const testButtonPress = async () => {
    console.log('🧪 Test button pressed!');
    
    // Test authentication first
    try {
      console.log('🧪 Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🧪 Auth status:', { user: !!user, error: authError });
      
      if (authError) {
        console.error('🧪 Auth error:', authError);
        Alert.alert('Auth Test', 'Authentication error: ' + authError.message);
        return;
      }
      
      if (!user) {
        console.log('🧪 No authenticated user');
        Alert.alert('Auth Test', 'No authenticated user found');
        return;
      }
      
      console.log('🧪 User authenticated:', user.id);
      
      // Test direct access to avatars bucket (skip listBuckets)
      console.log('🧪 Testing direct avatars bucket access...');
      const { data: files, error: filesError } = await supabase.storage
        .from('avatars')
        .list();
      
      console.log('🧪 Avatars bucket files:', files);
      console.log('🧪 Files error:', filesError);
      
      if (filesError) {
        console.error('🧪 Avatars bucket access error:', filesError);
        
        if (filesError.message.includes('bucket') || filesError.message.includes('not found')) {
          Alert.alert(
            'Storage Setup Required', 
            'The "avatars" storage bucket does not exist or is not accessible. Please check your Supabase storage setup.'
          );
        } else {
          Alert.alert('Storage Test', 'Error accessing avatars bucket: ' + filesError.message);
        }
        return;
      }
      
      console.log('🧪 Avatars bucket accessible!');
      Alert.alert('Storage Test', `✅ Avatars bucket is accessible! Files: ${files?.length || 0}`);
    } catch (error) {
      console.error('🧪 Storage test error:', error);
      Alert.alert('Storage Test Error', error instanceof Error ? error.message : 'Unknown error');
    }
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

      // Get the current session to ensure we have the most up-to-date user info
      const { data: { session } } = await supabase.auth.getSession();
      const verifiedPhoneNumber = session?.user?.phone || user.phone || null;
      
      console.log('📱 Phone number from session:', session?.user?.phone);
      console.log('📱 Phone number from user object:', user.phone);
      console.log('📱 Final verified phone number:', verifiedPhoneNumber);
      
      // Store phone number without + prefix to match existing database format
      const phoneNumberForStorage = verifiedPhoneNumber?.startsWith('+') 
        ? verifiedPhoneNumber.substring(1) 
        : verifiedPhoneNumber;
      
      console.log('📱 Phone number for storage (without +):', phoneNumberForStorage);

      // Upload profile image if selected
      let avatarUrl = null;
      if (profileImage) {
        try {
          console.log('📤 Uploading profile image...');
          console.log('📤 Image URI:', profileImage);
          
          // Convert image to blob
          console.log('📤 Converting image to blob...');
          const response = await fetch(profileImage);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          const blob = await response.blob();
          console.log('📤 Blob created, size:', blob.size);
          
          // Generate unique filename with proper extension
          let fileExt = 'jpg'; // default extension
          if (profileImage.includes('.')) {
            const ext = profileImage.split('.').pop()?.toLowerCase();
            if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
              fileExt = ext;
            }
          }
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          console.log('📤 Generated filename:', fileName);
          
          // Try to upload to Supabase storage with proper error handling
          console.log('📤 Attempting to upload to Supabase storage...');
          let { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: true,
              contentType: `image/${fileExt}`
            });
            
          if (uploadError) {
            console.error('❌ Error uploading image:', uploadError);
            console.error('❌ Error details:', uploadError.message);
            
            // Try alternative approach - convert to base64
            console.log('🔄 Trying alternative upload method...');
            
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
            });
            reader.readAsDataURL(blob);
            const base64Data = await base64Promise;
            
            // Remove data URL prefix to get just the base64 data
            const base64String = base64Data.split(',')[1];
            
            // Upload as text file
            const { data: altUploadData, error: altUploadError } = await supabase.storage
              .from('avatars')
              .upload(fileName, base64String, {
                cacheControl: '3600',
                upsert: true,
                contentType: `image/${fileExt}`
              });
              
            if (altUploadError) {
              console.error('❌ Alternative upload also failed:', altUploadError);
              throw new Error('All upload methods failed');
            }
            
            console.log('✅ Alternative upload successful!');
            uploadData = altUploadData;
          } else {
            console.log('✅ Direct upload successful!');
          }
          
          // Verify upload was successful
          console.log('🔍 Verifying upload...');
          const { data: fileInfo, error: fileError } = await supabase.storage
            .from('avatars')
            .list('', {
              search: fileName
            });
            
          if (fileError || !fileInfo || fileInfo.length === 0) {
            console.error('❌ Could not verify uploaded file');
            throw new Error('Upload verification failed');
          }
          
          const uploadedFile = fileInfo[0];
          console.log('📊 Uploaded file info:', uploadedFile);
          
          if (uploadedFile.metadata?.size === 0) {
            console.error('❌ Uploaded file is empty (0 bytes)');
            throw new Error('Uploaded file is empty');
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
            
          avatarUrl = urlData.publicUrl;
          console.log('✅ Profile image uploaded successfully:', avatarUrl);
        } catch (error) {
          console.error('❌ Error processing image upload:', error);
          console.log('⚠️ Continuing with local image due to error');
          avatarUrl = profileImage;
        }
      }

      // Prepare profile data
      const profileData = {
        id: user.id,
        username: username.trim(),
        full_name: name.trim(),
        bio: bio.trim() || null,
        birthday: formattedBirthday,
        gender: selectedGender.toLowerCase() || null,
        university: campus.trim(),
        phone_number: phoneNumberForStorage,
        avatar_url: avatarUrl,
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
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol size={20} name="chevron.left" color="#4F70FF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Set up profile</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Modern Profile Image Section */}
          <View style={styles.profileImageSection}>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              onPress={handleUpload}
              onLongPress={handleTakePhoto}
              disabled={isUploadingImage}
            >
              {profileImage ? (
                <View style={styles.avatarImageContainer}>
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  {isUploadingImage && (
                    <View style={styles.avatarLoadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  {isUploadingImage ? (
                    <ActivityIndicator size="large" color="#CCCCCC" />
                  ) : (
                    <IconSymbol size={32} name="person.fill" color="#CCCCCC" />
                  )}
                </View>
              )}
              <View style={styles.avatarOverlay}>
                <IconSymbol size={20} name="camera" color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.uploadText}>
              {isUploadingImage ? 'Processing...' : 'Tap to upload • Long press for camera'}
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999999"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999999"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram Handle</Text>
              <TextInput
                style={styles.input}
                placeholder="@yourhandle"
                placeholderTextColor="#999999"
                value={instagramHandle}
                onChangeText={setInstagramHandle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#999999"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Enhanced Gender Selection */}
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
                    activeOpacity={0.8}
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

            {/* Enhanced Birthday Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birthday</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor="#999999"
                  value={birthday}
                  onChangeText={setBirthday}
                />
                <TouchableOpacity style={styles.calendarIcon}>
                  <IconSymbol size={20} name="calendar" color="#7B61FF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Must be 18 or older to use this app</Text>
            </View>

            {/* Enhanced Campus Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus</Text>
              <View style={styles.campusInputContainer}>
                <TextInput
                  style={[styles.input, styles.campusInput]}
                  value={campus}
                  editable={false}
                />
                <TouchableOpacity style={styles.dropdownIcon}>
                  <IconSymbol size={20} name="chevron.down" color="#7B61FF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modern Complete Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            { opacity: (isFormValid && !isLoading) ? 1 : 0.6 }
          ]} 
          onPress={handleComplete} 
          disabled={!isFormValid || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.completeButtonText}>Complete →</Text>
          )}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#4F70FF',
    marginLeft: 4,
    fontWeight: '400',
  },
  titleSection: {
    marginBottom: 40,
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
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7B61FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
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
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1B1F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  genderButtonActive: {
    backgroundColor: '#7B61FF',
    borderColor: '#7B61FF',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  genderButtonInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  genderButtonTextInactive: {
    color: '#7B61FF',
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
    top: 14,
  },
  campusInputContainer: {
    position: 'relative',
  },
  campusInput: {
    paddingRight: 50,
    backgroundColor: '#F8F8F8',
    borderColor: '#E0E0E0',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  helpText: {
    fontSize: 12,
    color: '#7B61FF',
    marginTop: 6,
    fontWeight: '500',
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  completeButton: {
    backgroundColor: '#7B61FF',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  testButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});