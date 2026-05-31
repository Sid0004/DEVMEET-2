'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '../redux/store';
import { apiRequest } from '@/lib/api';
import { setCredentials, User } from '@/redux/features/authSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState(() => makeStore());

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiRequest<{ data: User }>('/api/v1/users/current-user');
        if (response.data) {
          store.dispatch(setCredentials({ user: response.data }));
        }
      } catch {
        console.log("Not logged in or session expired");
      }
    };

    loadUser();
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
