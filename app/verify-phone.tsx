
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      const otpString = newOtp.join('');
      handleVerify(otpString);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const otpString = otpCode || otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Verifying OTP:', otpString);
      
      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpString,
        type: 'sms',
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        if (error.message.includes('Invalid token')) {
          Alert.alert('Invalid Code', 'The verification code is incorrect. Please try again.');
        } else if (error.message.includes('expired')) {
          Alert.alert('Code Expired', 'The verification code has expired. Please request a new one.');
        } else {
          Alert.alert('Verification Failed', error.message || 'Failed to verify code');
        }
        
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      if (session) {
        // Verification successful
        console.log('Verification successful', session);
        
        // Check if a profile already exists for this phone number
        try {
          console.log('🔍 Checking for existing profile with phone number:', phoneNumber);
          
          // Try to find profile with the exact phone number first
          let { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('phone_number', phoneNumber)
            .single();

          // If not found, try without the + prefix (in case it's stored without +)
          if (profileError && profileError.code === 'PGRST116') {
            const phoneWithoutPlus = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
            console.log('🔍 Trying without + prefix:', phoneWithoutPlus);
            
            const { data: profileWithoutPlus, error: errorWithoutPlus } = await supabase
              .from('profiles')
              .select('*')
              .eq('phone_number', phoneWithoutPlus)
              .single();
              
            if (!errorWithoutPlus && profileWithoutPlus) {
              existingProfile = profileWithoutPlus;
              profileError = null;
            }
          }

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // PGRST116 is "not found" error, which is expected if no profile exists
              console.log('❌ No existing profile found for phone number:', phoneNumber);
            } else {
              console.error('❌ Error checking existing profile:', profileError);
            }
          }

          if (existingProfile) {
            console.log('✅ Existing profile found for phone number:', phoneNumber);
            console.log('📋 Profile details:', { id: existingProfile.id, username: existingProfile.username });
            // Profile already exists, go directly to main app
            router.replace('/(tabs)');
          } else {
            console.log('🆕 No existing profile found, continuing to setup flow');
            // No profile exists, continue to permissions setup
            router.push('/permissions');
          }
        } catch (error) {
          console.error('💥 Unexpected error checking existing profile:', error);
          // On error, default to permissions setup
          router.push('/permissions');
        }
      }
      
    } catch (error) {
      console.error('Unexpected error during verification:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not found. Please go back and try again.');
      return;
    }

    setIsResending(true);
    
    try {
      console.log('Resending code to:', phoneNumber);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) {
        console.error('Error resending OTP:', error);
        if (error.message.includes('rate limit')) {
          Alert.alert('Too Many Attempts', 'Please wait before requesting another code.');
        } else {
          Alert.alert('Error', error.message || 'Failed to resend verification code');
        }
        return;
      }

      Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
      
      // Reset OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
    } catch (error) {
      console.error('Unexpected error during resend:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

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

        {/* Content Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Verify Phone</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code we just sent to {phoneNumber || 'your phone'}.
          </Text>
        </View>

        {/* OTP Input Fields */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Resend Text */}
        <View style={styles.resendSection}>
          <Text style={styles.resendText}>
            Didn't get a code?{' '}
            <Text 
              style={[styles.resendLink, { opacity: isResending ? 0.6 : 1 }]} 
              onPress={isResending ? undefined : handleResend}
            >
              {isResending ? 'Sending...' : 'Resend'}
            </Text>
          </Text>
        </View>
      </View>

      {/* Verify Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[
            styles.verifyButton,
            { opacity: (isComplete && !isLoading) ? 1 : 0.6 }
          ]} 
          onPress={() => handleVerify()}
          disabled={!isComplete || isLoading}
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify →'}
          </Text>
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
  headerSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#D0C2FF',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1B1F',
    backgroundColor: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: '#7B3EFF',
    backgroundColor: '#F8F6FF',
  },
  resendSection: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    color: '#1C1B1F',
  },
  resendLink: {
    color: '#7B3EFF',
    textDecorationLine: 'underline',
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  verifyButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
