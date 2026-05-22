'use client';

import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '../redux/store';
import { apiRequest } from '@/lib/api';
import { setCredentials } from '@/redux/features/authSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiRequest<{ data: any }>('/api/v1/users/current-user');
        if (response.data) {
          storeRef.current?.dispatch(setCredentials({ user: response.data }));
        }
      } catch (error) {
        console.log("Not logged in or session expired");
      }
    };

    loadUser();
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
