
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PermissionsScreen() {
  const router = useRouter();

  const handleAllowNotifications = () => {
    // Handle notification permission request
    console.log('Requesting notification permissions');
  };

  const handleAllowLocation = () => {
    // Handle location permission request
    console.log('Requesting location permissions');
  };

  const handleContinue = () => {
    // Navigate to setup profile screen
    router.push('/setup-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>< Back</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Permissions</Text>
        </View>

        {/* Permission Options */}
        <View style={styles.permissionsSection}>
          {/* Notifications Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Text style={styles.bellIcon}>🔔</Text>
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.permissionTitle}>Notifications</Text>
              <Text style={styles.permissionSubtitle}>
                Enable alerts to get updates about events.
              </Text>
            </View>
            <TouchableOpacity style={styles.allowButton} onPress={handleAllowNotifications}>
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>

          {/* Location Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <IconSymbol size={20} name="paperplane.fill" color="#7B3EFF" />
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.permissionTitle}>Location</Text>
              <Text style={styles.permissionSubtitle}>
                Let us access your location to show nearby events.
              </Text>
            </View>
            <TouchableOpacity style={styles.allowButton} onPress={handleAllowLocation}>
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue →</Text>
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
    color: '#7B3EFF',
  },
  titleSection: {
    marginTop: 8,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  permissionsSection: {
    flex: 1,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  allowButton: {
    borderWidth: 1,
    borderColor: '#7B3EFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  allowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B3EFF',
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  continueButton: {
    backgroundColor: '#7B3EFF',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
