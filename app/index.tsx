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
    if (isReady) {
      checkAuthAndProfile();
    }
  }, [isReady, router]);

  const checkAuthAndProfile = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        // User not authenticated, go to phone verification
        router.replace('/phone-verification');
        return;
      }

      // User is authenticated, check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // Profile doesn't exist, go to setup profile
        router.replace('/setup-profile');
        return;
      }

      // Profile exists, go to main app  
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error checking auth and profile:', error);
      // On error, default to phone verification
      router.replace('/phone-verification');
    }
  };

  return null;
}