'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';

export default function FirebaseInitializer() {
  useEffect(() => {
    if (analytics) {
      console.log("Firebase Analytics initialized successfully.");
    }
  }, []);

  return null;
}
