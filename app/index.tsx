
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to phone verification on app start
    router.replace('/phone-verification');
  }, []);

  return null;
}
