import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AccountStatusRedirect = () => {
  const accountBlock = useAuthStore((state) => state.accountBlock);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!accountBlock) {
      return;
    }
    if (location.pathname !== '/cuenta-suspendida') {
      navigate('/cuenta-suspendida', { replace: true });
    }
  }, [accountBlock, location.pathname, navigate]);

  return null;
};

export default AccountStatusRedirect;
