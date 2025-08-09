import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure the navigation stack is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('🔄 Index useEffect triggered, isReady:', isReady);
    if (isReady) {
      console.log('🚀 Calling checkAuthAndProfile...');
      checkAuthAndProfile();
    }
  }, [isReady, router]);

  const checkAuthAndProfile = async () => {
    console.log('🔍 checkAuthAndProfile called');
    try {
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log('❌ User not authenticated, going to phone verification');
        // User not authenticated, go to phone verification
        router.replace('/phone-verification');
        return;
      }
      console.log('✅ User authenticated:', user.id);

      // User is authenticated, check if profile exists
      console.log('🔍 Checking profile for user:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.log('❌ Profile not found or error:', profileError);
        // Profile doesn't exist, go to setup profile
        console.log('🚀 Navigating to setup-profile for new user');
        router.replace('/setup-profile');
        return;
      }
      console.log('✅ Profile found:', profile.username);

      // Profile exists, go to main app  
      console.log('🚀 Navigating to main app (tabs)');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error checking auth and profile:', error);
      // On error, default to phone verification
      router.replace('/phone-verification');
    }
  };

  return null;
}