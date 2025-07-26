
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EventDetailsScreen from '../event-details';

export default function EventPage() {
  const { id } = useLocalSearchParams();
  
  // You can use the id to fetch specific event data
  // For now, we'll pass it to the EventDetailsScreen component
  
  return <EventDetailsScreen />;
}
