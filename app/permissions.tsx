
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

export default function PermissionsScreen() {
  const [notificationPermission, setNotificationPermission] = useState<string>('undetermined');
  const [locationPermission, setLocationPermission] = useState<string>('undetermined');

  const handleAllowNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status);
      
      if (status === 'granted') {
        Alert.alert('Success', 'Notification permissions granted!');
      } else if (status === 'denied') {
        Alert.alert('Denied', 'Notification permissions were denied. You can enable them in Settings.');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions');
    }
  };

  const handleAllowLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        Alert.alert('Success', 'Location permissions granted!');
      } else if (status === 'denied') {
        Alert.alert('Denied', 'Location permissions were denied. You can enable them in Settings.');
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      Alert.alert('Error', 'Failed to request location permissions');
    }
  };

  const handleContinue = () => {
    router.push('/setup-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{"< Back"}</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Permissions</Text>
        </View>

        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          {/* Notifications Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <IconSymbol size={20} name="bell.fill" color="#7B3EFF" />
              </View>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.permissionTitle}>Notifications</Text>
              <Text style={styles.permissionSubtitle}>
                Enable alerts to get updates about events.
              </Text>
            </View>
            <TouchableOpacity style={styles.allowButton} onPress={handleAllowNotifications}>
              <Text style={styles.allowButtonText}>
                {notificationPermission === 'granted' ? 'Granted' : 'Allow'}
              </Text>
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
              <Text style={styles.allowButtonText}>
                {locationPermission === 'granted' ? 'Granted' : 'Allow'}
              </Text>
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
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#7B3EFF',
    fontWeight: '500',
  },
  titleSection: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  permissionsContainer: {
    gap: 24,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  allowButton: {
    borderWidth: 1,
    borderColor: '#7B3EFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  allowButtonText: {
    color: '#7B3EFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
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
