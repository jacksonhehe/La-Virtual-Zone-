import { useAuthStore } from '../store/authStore';

const useCan = (roles: string[]) => {
  const role = useAuthStore(state => state.user?.role);
  return roles.includes(role || '');
};

export default useCan;
