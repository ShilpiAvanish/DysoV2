
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EventDetailsScreen from '../event-details';

export default function EventPage() {
  const { id } = useLocalSearchParams();
  
  console.log('🎯 Event ID from route:', id);
  
  return <EventDetailsScreen />;
}
