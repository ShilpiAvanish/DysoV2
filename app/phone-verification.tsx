
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSendCode = () => {
    if (phoneNumber.trim()) {
      // Navigate to verification code screen
      console.log('Sending code to:', phoneNumber);
      router.push('/verify-phone');
    }
  };

  const handleTermsPress = () => {
    // Open Terms & Conditions
    Linking.openURL('https://your-app.com/terms');
  };

  const handlePrivacyPress = () => {
    // Open Privacy Policy
    Linking.openURL('https://your-app.com/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title & Subtitle */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Welcome to the party 🎉</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get a verification code.
          </Text>
        </View>

        {/* Phone Input Field */}
        <View style={styles.inputSection}>
          <View style={styles.phoneInputContainer}>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              placeholderTextColor="#8E8E93"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <View style={styles.countryDropdown}>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </View>
        </View>

        {/* Terms & Privacy */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText} onPress={handleTermsPress}>
              Terms & Conditions
            </Text>
            {' '}and{' '}
            <Text style={styles.linkText} onPress={handlePrivacyPress}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[
            styles.sendButton,
            { opacity: phoneNumber.trim() ? 1 : 0.6 }
          ]} 
          onPress={handleSendCode}
          disabled={!phoneNumber.trim()}
        >
          <Text style={styles.sendButtonText}>Send Code →</Text>
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
    paddingTop: 60,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1B1F',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 40,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0C2FF',
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    height: 56,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1B1F',
    paddingVertical: 0,
  },
  countryDropdown: {
    paddingLeft: 12,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#8E8E93',
  },
  termsSection: {
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 14,
    color: '#1C1B1F',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#4F6BED',
    textDecorationLine: 'underline',
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  sendButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
