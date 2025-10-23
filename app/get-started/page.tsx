'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GetStartedPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/content-strategy-survey');
  }, [router]);

  return null;
}
