import { useEffect } from 'react';
import { requestPermission } from '../firebase';
import { useAuthStore } from '../store/authStore';

export default function useFCM() {
  const { user } = useAuthStore();
  useEffect(() => {
    if (!user) return;
    requestPermission().then((token) => {
      if (token) {
        fetch('http://localhost:3001/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: user.username, token }),
        }).catch(console.error);
      }
    });
  }, [user]);
}
