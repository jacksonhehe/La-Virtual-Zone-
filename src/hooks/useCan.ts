import { useAuthStore } from '../store/authStore';

export default function useCan(roles: string[]): boolean {
  const user = useAuthStore.getState().user;
  return !!user && roles.includes(user.role);
}
